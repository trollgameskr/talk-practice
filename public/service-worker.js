// Service Worker for GeminiTalk PWA
// This enables offline functionality and faster loading

const CACHE_NAME = 'geminitalk-cache-v1-__BUILD_TIMESTAMP__';
const urlsToCache = [
  '/',
  '/index.html',
  '/bundle.js',
  '/manifest.json',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching files');
      return cache.addAll(urlsToCache).catch((error) => {
        console.error('Service Worker: Cache addAll failed:', error);
        // Don't fail installation if caching fails
        return Promise.resolve();
      });
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request).catch((error) => {
        console.error('Service Worker: Fetch failed:', error);
        // Return a basic offline page if available
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        throw error;
      });
    })
  );
});
