// AniGO Service Worker — Offline-first cache strategy
const CACHE_NAME = 'anigo-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './css/styles.css',
  './js/ui.js',
  './js/data.js',
  './js/game.js',
  './js/board.js',
  './js/spells.js',
  './js/ai.js',
  './js/audio.js',
  './js/i18n.js',
  './js/auth.js',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon.svg',
  './assets/art/champions/kumiho.webp',
  './assets/art/champions/musubi.webp',
  './assets/art/champions/raijin.webp',
  './assets/art/champions/ryujin.webp',
  './assets/art/champions/seolhwa.webp'
];

// Install — precache all core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache-first, fall back to network, then cache the response
self.addEventListener('fetch', (event) => {
  // Skip non-GET and cross-origin requests (except Google Fonts)
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isGoogleFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  const isSameOrigin = url.origin === location.origin;

  if (!isSameOrigin && !isGoogleFont) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Don't cache bad responses
        if (!response || response.status !== 200) return response;

        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
