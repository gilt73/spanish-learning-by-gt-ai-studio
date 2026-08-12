#!/usr/bin/env node
/**
 * seed-songs.js — One-time script to generate songs.json from local .txt lyrics files.
 * 
 * Usage: node seed-songs.js
 * Requires: GEMINI_API_KEY in .env, lyrics .txt files in "Songs Lyrics/" directory.
 * Output: songs.json in project root (loaded by the app on first launch).
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const LYRICS_DIR = path.join(__dirname, 'Songs Lyrics');
const OUTPUT_FILE = path.join(__dirname, 'songs.json');
const AUDIO_DIR = path.join(__dirname, 'audio');

if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env. Please add it and try again.');
    process.exit(1);
}
if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env. Please add it and try again.');
    process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
// Known metadata for each song (trackId, albumArt, spotify_url, genre, level)
const SONG_METADATA = {
    'amores como el nuestro': {
        id: 'amores-como-el-nuestro',
        trackId: '3dUOVExxPh0nmE6DtYVWIE',
        albumArt: 'https://i.scdn.co/image/ab67616d00001e0210a9f305f4826ba8ce8bfaa0',
        spotify_url: 'https://open.spotify.com/track/3dUOVExxPh0nmE6DtYVWIE',
        genre: 'Salsa',
        level: 'expert',
        cover: '🎺'
    },
    'la cita': {
        id: 'la-cita',
        trackId: '0XQzw53uo8V4GErre45Az1',
        albumArt: 'https://i.scdn.co/image/ab67616d00001e0216e5246b005aaeae2a3b4f70',
        spotify_url: 'https://open.spotify.com/track/0XQzw53uo8V4GErre45Az1',
        genre: 'Salsa',
        level: 'beginner',
        cover: '🎺'
    },
    'me tengo que ir': {
        id: 'me-tengo-que-ir',
        trackId: '3fccHyCREvjvDinu9TPZv9',
        albumArt: 'https://i.scdn.co/image/ab67616d00001e028a7fa93d6c42e82149866c76',
        spotify_url: 'https://open.spotify.com/track/3fccHyCREvjvDinu9TPZv9',
        genre: 'Salsa',
        level: 'intermediate',
        cover: '🎺'
    },
    'persona ideal': {
        id: 'persona-ideal',
        trackId: '5H1mAzh396id1TPT0JaItz',
        albumArt: 'https://i.scdn.co/image/ab67616d00001e023463634e7bde025aa312cb8e',
        spotify_url: 'https://open.spotify.com/track/5H1mAzh396id1TPT0JaItz',
        genre: 'Salsa',
        level: 'intermediate',
        cover: '🎺'
    },
    'te va a doler': {
        id: 'te-va-a-doler',
        trackId: '2ozSogNm6z9G2Uv6a9iji4',
        albumArt: 'https://i.scdn.co/image/ab67616d00001e026bccd61ccb76645a10625854',
        spotify_url: 'https://open.spotify.com/track/2ozSogNm6z9G2Uv6a9iji4',
        genre: 'Salsa',
        level: 'beginner',
        cover: '🎺'
    }
};

function parseFileName(filename) {
    // "Amores Como el Nuestro by Jerry Rivera.txt" → { title, artist }
    const base = path.basename(filename, '.txt');
    const byIndex = base.lastIndexOf(' by ');
    if (byIndex === -1) {
        return { title: base, artist: 'Unknown' };
    }
    return {
        title: base.substring(0, byIndex).trim(),
        artist: base.substring(byIndex + 4).trim()
    };
}

async function callGemini(title, artist, lyrics) {
    const prompt = `You are a Spanish language teacher for Hebrew speakers. You will analyze these song lyrics and return a structured JSON lesson.

Song: "${title}" by ${artist}

RAW LYRICS:
${lyrics}

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "lines": [
    {
      "id": 1,
      "spanish_text": "The original Spanish sentence/phrase",
      "hebrew_translation": "The idiomatic Hebrew translation (not word-for-word literal)",
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
2. The "hebrew_translation" must be natural spoken Hebrew, not a dictionary translation.
3. For each line, include only the 2-4 most educational/interesting words in "words" array.
4. The "vocabulary" array should contain the 10-15 most useful words from the entire song.
5. "pron" must be Hebrew phonetic pronunciation written in Hebrew letters with vowel marks (nikud), like: קוֹרָסוֹן, אָמוֹר, בַּיְילָה
6. category must be one of: "verb", "noun", "adjective", "phrase", "pronoun"
7. Do NOT include duplicates in vocabulary.
8. Return ONLY the raw JSON object, starting with { and ending with }`;

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    return JSON.parse(cleaned);
}

async function callGeminiWithRetry(title, artist, lyrics, maxRetries = 4) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await callGemini(title, artist, lyrics);
        } catch (err) {
            const is429 = err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED');
            if (is429 && attempt < maxRetries) {
                const waitSec = 65 * attempt;
                console.log(`  ⏳ Rate limited. Waiting ${waitSec}s before retry ${attempt}/${maxRetries - 1}...`);
                await new Promise(r => setTimeout(r, waitSec * 1000));
            } else {
                throw err;
            }
        }
    }
}

async function processSong(filename) {
    const { title, artist } = parseFileName(filename);
    const lyrics = fs.readFileSync(path.join(LYRICS_DIR, filename), 'utf8').trim();
    const titleKey = title.toLowerCase();

    const meta = SONG_METADATA[titleKey] || {
        id: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        trackId: null,
        albumArt: null,
        spotify_url: null,
        genre: 'Salsa',
        level: 'beginner',
        cover: '🎵'
    };

    console.log(`  📡 Calling Gemini for: "${title}" by ${artist}...`);
    const lyricsData = await callGeminiWithRetry(title, artist, lyrics);
    console.log(`  ✅ Got ${lyricsData.lines?.length || 0} lines, ${lyricsData.vocabulary?.length || 0} vocab words`);

    // Ensure audio directory exists
    const songAudioDir = path.join(AUDIO_DIR, meta.id);
    if (!fs.existsSync(songAudioDir)) {
        fs.mkdirSync(songAudioDir, { recursive: true });
    }

    console.log(`  🔊 Generating audio with OpenAI TTS for ${lyricsData.lines?.length} lines...`);
    for (let i = 0; i < (lyricsData.lines || []).length; i++) {
        const line = lyricsData.lines[i];
        const esFileName = `${String(i).padStart(2, '0')}_es.mp3`;
        const heFileName = `${String(i).padStart(2, '0')}_he.mp3`;
        const esFilePath = path.join(songAudioDir, esFileName);
        const heFilePath = path.join(songAudioDir, heFileName);
        
        // Only generate if not exists (allows partial resumes)
        if (!fs.existsSync(esFilePath)) {
            const mp3 = await openai.audio.speech.create({
                model: "tts-1",
                voice: "nova",
                input: line.spanish_text,
            });
            const buffer = Buffer.from(await mp3.arrayBuffer());
            await fs.promises.writeFile(esFilePath, buffer);
        }
        
        if (!fs.existsSync(heFilePath)) {
            const mp3 = await openai.audio.speech.create({
                model: "tts-1",
                voice: "nova",
                input: line.hebrew_translation,
            });
            const buffer = Buffer.from(await mp3.arrayBuffer());
            await fs.promises.writeFile(heFilePath, buffer);
        }

        line.audio_es_path = `audio/${meta.id}/${esFileName}`;
        line.audio_he_path = `audio/${meta.id}/${heFileName}`;
    }

    return {
        id: meta.id,
        title,
        artist,
        spotify_url: meta.spotify_url,
        trackId: meta.trackId,
        albumArt: meta.albumArt,
        genre: meta.genre,
        level: meta.level,
        cover: meta.cover,
        locked: false,
        lyrics_data: lyricsData,
        lines: lyricsData.lines || [],
        progress_percentage: 0,
        is_mastered: false
    };
}

async function main() {
    console.log('\n🎵 Spanish Learning — Seed Script\n');
    console.log(`📂 Reading lyrics from: ${LYRICS_DIR}\n`);

    if (!fs.existsSync(LYRICS_DIR)) {
        console.error(`❌ Lyrics directory not found: ${LYRICS_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(LYRICS_DIR).filter(f => f.endsWith('.txt'));
    if (files.length === 0) {
        console.error('❌ No .txt files found in Songs Lyrics/');
        process.exit(1);
    }

    console.log(`Found ${files.length} lyrics files:\n${files.map(f => `  • ${f}`).join('\n')}\n`);
    console.log('ℹ️  Free-tier rate limit: waiting 65s between songs to avoid throttling.\n');

    const songs = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`\n🎶 [${i + 1}/${files.length}] Processing: ${file}`);
        try {
            const song = await processSong(file);
            songs.push(song);
            // Save incrementally after each success so partial results are preserved
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(songs, null, 2), 'utf8');
            console.log(`  💾 Saved progress (${songs.length} songs so far)`);
            // Polite delay between songs — free tier allows ~2 req/min
            if (i < files.length - 1) {
                console.log('  ⏸  Waiting 65s before next song (free-tier rate limit)...');
                await new Promise(r => setTimeout(r, 65000));
            }
        } catch (err) {
            console.error(`  ❌ Failed after retries: ${err.message}`);
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(songs, null, 2), 'utf8');
    console.log(`\n✅ Done! Written ${songs.length} / ${files.length} songs to songs.json`);
    console.log(`📄 File: ${OUTPUT_FILE}\n`);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
