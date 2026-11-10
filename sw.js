// Service Worker for ACS Pharmacy Network & Drugs Systems PWA
const CACHE_NAME = 'acs-pwa-cache-v2';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon-48x48.png',
  '/favicon-96x96.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// Install Event - Precache core shell assets and skip waiting immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('PWA Precache warning (some assets may be optional):', err);
      });
    })
  );
});

// Activate Event - Purge ALL stale caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-First for same-origin assets so visitors always run
// the latest deployed code online, seamlessly falling back to cache when offline.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // External CDNs & fonts: Cache-first with network fallback
  if (url.origin !== location.origin) {
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

  // Same-origin assets: Network-First strategy
  event.respondWith(
    fetch(event.request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const resClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
      }
      return networkResponse;
    }).catch(() => {
      // Offline fallback: serve from local cache
      return caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/') || caches.match('/index.html');
        }
        return null;
      });
    })
  );
});
