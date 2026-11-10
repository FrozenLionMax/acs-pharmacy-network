// Service Worker Decommissioner & Complete Cache Purge
// Cleans up all existing caches and unregisters to guarantee fresh live assets.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => {
        console.log('[SW Purge] Deleting cache:', k);
        return caches.delete(k);
      }));
    })
    .then(() => self.registration.unregister())
    .then(() => self.clients.claim())
  );
});

// Pass all requests straight to the live network without interception
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
