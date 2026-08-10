// Small proxy server for Spotify's Client Credentials flow + Gemini AI lesson generation.
// Keeps SPOTIFY_CLIENT_SECRET and GEMINI_API_KEY server-side only — never sent to the browser.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json({ limit: '50kb' }));
app.use(express.static(__dirname));

// ---- Spotify Token Cache ----
let cachedToken = null;
let cachedTokenExpiry = 0;

async function getSpotifyToken() {
    if (cachedToken && Date.now() < cachedTokenExpiry) {
        return cachedToken;
    }
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET in .env');
    }

    const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Spotify token request failed (${res.status}): ${text}`);
    }

    const data = await res.json();
    cachedToken = data.access_token;
    cachedTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return cachedToken;
}

// ---- Spotify Search ----
app.get('/api/search', async (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) {
        return res.status(400).json({ error: 'missing query param q' });
    }

    try {
        const token = await getSpotifyToken();
        const searchRes = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=8`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!searchRes.ok) {
            const text = await searchRes.text();
            return res.status(searchRes.status).json({ error: 'Spotify search failed', detail: text });
        }

        const data = await searchRes.json();
        const tracks = (data.tracks?.items || []).map(t => ({
            id: t.id,
            name: t.name,
            artists: t.artists.map(a => a.name).join(', '),
            albumArt: t.album.images?.[1]?.url || t.album.images?.[0]?.url || '',
            spotifyUrl: t.external_urls.spotify
        }));

        res.json({ tracks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ---- Serve songs.json (seed data) ----
app.get('/api/songs', (req, res) => {
    const songsPath = path.join(__dirname, 'songs.json');
    if (fs.existsSync(songsPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(songsPath, 'utf8'));
            res.json(data);
        } catch (e) {
            res.json([]);
        }
    } else {
        res.json([]);
    }
});

// ---- Gemini AI Lesson Generator ----
app.post('/api/generate-lesson', async (req, res) => {
    const { title, artist, spotify_url, lyrics } = req.body || {};

    if (!lyrics || !title || !artist) {
        return res.status(400).json({ error: 'Missing required fields: title, artist, lyrics' });
    }

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not set in .env' });
    }

    const prompt = `You are a Spanish language teacher for Hebrew speakers. You will analyze these song lyrics and return a structured JSON lesson.

Song: "${title}" by ${artist}

RAW LYRICS:
${lyrics}

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "lines": [
    {
      "id": 1,
      "es": "The original Spanish sentence/phrase",
      "he": "The idiomatic Hebrew translation (not word-for-word literal)",
      "words": [
        { "es": "Spanish word or short phrase", "he": "Hebrew meaning", "pron": "Hebrew phonetic pronunciation like קוֹרָסוֹן" }
      ]
    }
  ],
  "vocabulary": [
    { "es": "word", "he": "Hebrew meaning", "pron": "Hebrew phonetic", "category": "verb" }
  ]
}

Rules:
1. Split the lyrics into natural phrases/sentences (one line of the song = one entry, skip pure repetition if a phrase repeats more than 3 times).
2. The "he" translation must be natural spoken Hebrew, not a dictionary translation.
3. For each line, include only the 2-4 most educational/interesting words in "words" array.
4. The "vocabulary" array should contain the 10-15 most useful words from the entire song.
5. "pron" must be Hebrew phonetic pronunciation written in Hebrew letters with vowel marks (nikud), like: קוֹרָסוֹן, אָמוֹר, בַּיְילָה
6. category must be one of: "verb", "noun", "adjective", "phrase", "pronoun"
7. Do NOT include duplicates in vocabulary.
8. Return ONLY the raw JSON object, starting with { and ending with }`;

    try {
        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 8192
                    }
                })
            }
        );

        if (!geminiRes.ok) {
            const errText = await geminiRes.text();
            console.error('Gemini error:', errText);
            return res.status(geminiRes.status).json({ error: 'Gemini API failed', detail: errText });
        }

        const geminiData = await geminiRes.json();
        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Strip any accidental markdown code fences
        const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

        let parsedLesson;
        try {
            parsedLesson = JSON.parse(cleaned);
        } catch (parseErr) {
            console.error('JSON parse error. Raw output:', rawText);
            return res.status(500).json({ error: 'Failed to parse Gemini response as JSON', raw: rawText });
        }

        res.json({ lyrics_data: parsedLesson });
    } catch (err) {
        console.error('generate-lesson error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🎵 Spanish Learning server running at http://localhost:${PORT}`);
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.warn('⚠️  SPOTIFY keys not set — /api/search will fail.');
    }
    if (!GEMINI_API_KEY) {
        console.warn('⚠️  GEMINI_API_KEY not set — /api/generate-lesson will fail.');
    } else {
        console.log('✅ Gemini API key loaded');
    }
});
