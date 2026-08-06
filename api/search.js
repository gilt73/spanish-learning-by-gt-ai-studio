// Vercel serverless function version of the /api/search endpoint.
// Same Client Credentials logic as server.js (used for local dev with `npm start`),
// adapted to Vercel's (req, res) function signature instead of Express.

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let cachedToken = null;
let cachedTokenExpiry = 0;

async function getSpotifyToken() {
    if (cachedToken && Date.now() < cachedTokenExpiry) {
        return cachedToken;
    }
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET env vars');
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

module.exports = async (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) {
        res.status(400).json({ error: 'missing query param q' });
        return;
    }

    try {
        const token = await getSpotifyToken();
        const searchRes = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=8`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!searchRes.ok) {
            const text = await searchRes.text();
            res.status(searchRes.status).json({ error: 'Spotify search failed', detail: text });
            return;
        }

        const data = await searchRes.json();
        const tracks = (data.tracks?.items || []).map(t => ({
            id: t.id,
            name: t.name,
            artists: t.artists.map(a => a.name).join(', '),
            albumArt: t.album.images?.[1]?.url || t.album.images?.[0]?.url || '',
            spotifyUrl: t.external_urls.spotify
        }));

        res.status(200).json({ tracks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
