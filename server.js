// Small proxy server for Spotify's Client Credentials flow.
// Keeps SPOTIFY_CLIENT_SECRET server-side only — never sent to the browser.
// Enables real text search ("V1.1b" in SPEC.md), on top of the no-auth
// oEmbed link-import flow that already works purely client-side (V1.1).

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

app.use(cors());
app.use(express.static(__dirname));

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
    // refresh a minute early to be safe
    cachedTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return cachedToken;
}

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

app.listen(PORT, () => {
    console.log(`Spanish Learning server running at http://localhost:${PORT}`);
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.warn('Warning: SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET not set — /api/search will fail. Copy .env.example to .env and fill them in.');
    }
});
