// Service Worker for GeminiTalk PWA
const CACHE_NAME = 'geminitalk-__BUILD_TIMESTAMP__';

// Use relative paths so the service worker works both in dev (/) and deployed (/talk-practice/)
const urlsToCache = [
  './',
  './index.html',
  './bundle.js',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  // Install: fetch & cache resources one-by-one and skip any non-HTTP(s) or failed requests.
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    console.log('Opened cache');

    const base = new URL('.', self.location.href).href; // resolves relative urls against worker location

    for (const url of urlsToCache) {
      const resolvedUrl = new URL(url, base).href;

      try {
        // Only attempt to cache http(s) schemes
        const parsed = new URL(resolvedUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          console.warn('Skipping non-HTTP(s) resource for caching:', resolvedUrl);
          continue;
        }

        const response = await fetch(resolvedUrl, { credentials: 'same-origin' });
        if (!response || !response.ok) {
          console.warn('Skipping resource; fetch failed or not ok:', resolvedUrl, response && response.status);
          continue;
        }

        // Only cache basic, same-origin responses (avoid opaque/cross-origin/extension resources)
        if (response.type !== 'basic') {
          console.warn('Skipping non-basic response from caching:', resolvedUrl, response.type);
          continue;
        }

        await cache.put(resolvedUrl, response.clone());
      } catch (error) {
        // Log and continue - don't fail install when a single resource can't be cached
        console.warn('Failed to cache resource:', resolvedUrl, error);
      }
    }
  })());
  // Skip waiting to activate new service worker immediately
  // This ensures old cached files are cleared promptly
  self.skipWaiting();
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    try {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      // Only handle GET requests for caching
      if (event.request.method !== 'GET') {
        return fetch(event.request);
      }

      // Skip caching non-http(s) schemes (e.g., chrome-extension://)
      try {
        const reqUrl = new URL(event.request.url);
        if (reqUrl.protocol !== 'http:' && reqUrl.protocol !== 'https:') {
          return fetch(event.request);
        }
      } catch (e) {
        // If URL parsing fails, just fetch
        return fetch(event.request);
      }

      const fetchRequest = event.request.clone();
      const response = await fetch(fetchRequest);

      // If the response is not valid or not same-origin basic, return it without caching
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      const responseToCache = response.clone();
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, responseToCache);
      } catch (err) {
        // Don't let cache failures break the network response
        console.warn('Cache put failed for', event.request.url, err);
      }

      return response;
    } catch (err) {
      // On any unexpected error, try to serve the offline index fallback
      console.warn('Fetch handler error', err);
      return caches.match('./index.html');
    }
  })());
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      // This ensures the new service worker serves content right away
      return self.clients.claim();
    })
  );
});
