// sw.js — Spanish Learning Service Worker v2.1.1
const CACHE_NAME = 'spanish-learning-v2.1.1';
const ASSETS_TO_CACHE = [
    './',
    './styles.css',
    './app.js',
    './data.js',
    './songs.json',
    './wordbank.js',
    './manifest.json',
    './version.json',
    './icon.svg',
    './icon-192.png',
    './icon-512.png',
    './icon-180.png'
];

// ---- Install Event ----
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// ---- Activate Event — Clean old caches ----
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// ---- Fetch Event ----
// Network-first for: index.html, version.json, and API calls
// Cache-first with background refresh for static assets
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Always network-first for the main document and version check
    if (
        url.pathname.endsWith('version.json') ||
        url.pathname.startsWith('/api/') ||
        url.pathname === '/' ||
        url.pathname.endsWith('index.html')
    ) {
        event.respondWith(
            fetch(event.request, { cache: 'no-cache' })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first, with stale-while-revalidate for static assets
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Fetch in background to update cache (stale-while-revalidate)
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse);
                        });
                    }
                }).catch(() => {});
                return cachedResponse;
            }
            // If not in cache, fetch it and cache it (runtime caching)
            return fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const clonedResponse = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clonedResponse);
                    });
                }
                return networkResponse;
            });
        })
    );
});

// ---- Message Event ----
self.addEventListener('message', (event) => {
    // Standard skip waiting
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }

    // Force update: wipe all caches then activate new SW immediately
    if (event.data === 'FORCE_UPDATE') {
        event.waitUntil(
            caches.keys()
                .then(keys => Promise.all(keys.map(k => caches.delete(k))))
                .then(() => self.skipWaiting())
        );
    }
});
