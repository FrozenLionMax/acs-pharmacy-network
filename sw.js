// Service Worker for ACS Pharmacy Network & Drugs Systems PWA
const CACHE_NAME = 'acs-pwa-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/data.js',
  '/styles.css',
  '/manifest.json',
  '/favicon.svg',
  '/favicon-48x48.png',
  '/favicon-96x96.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// Install Event - Precache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('PWA Precache warning (some assets may be optional):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches and claim clients
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

// Fetch Event - Stale-while-revalidate strategy with offline fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip external analytics/google indexing endpoints from caching
  if (url.origin !== location.origin) {
    // For third-party fonts or cdn scripts, cache-first with network fallback
    if (url.href.includes('cdnjs.cloudflare.com') || url.href.includes('fonts.googleapis.com') || url.href.includes('cdn.tailwindcss.com')) {
      event.respondWith(
        caches.match(event.request).then((cached) => {
          return cached || fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              const resClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
            }
            return response;
          }).catch(() => cached);
        })
      );
    }
    return;
  }

  // Same-origin requests: Stale-While-Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // If offline and request is an HTML navigation, return cached root
          if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
            return cache.match('/') || cache.match('/index.html');
          }
          return cachedResponse;
        });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
