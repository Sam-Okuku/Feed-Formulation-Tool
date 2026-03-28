/* ============================================================
   Village Prime Feed Tool — Service Worker v2.0
   Fixed for GitHub Pages at /Feed-Formulation-Tool/
   ============================================================ */

const CACHE_NAME = 'vp-feed-tool-v2';
const BASE = '/Feed-Formulation-Tool';

const PRECACHE = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/icons/icon-192.png',
  BASE + '/icons/icon-512.png'
];

/* INSTALL — cache core files immediately */
self.addEventListener('install', event => {
  console.log('[SW] Installing v2...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

/* ACTIVATE — delete old caches */
self.addEventListener('activate', event => {
  console.log('[SW] Activating v2...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* FETCH — cache-first with network fallback */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        /* Serve from cache, update in background */
        fetch(event.request).then(resp => {
          if (resp && resp.status === 200) {
            caches.open(CACHE_NAME).then(c => c.put(event.request, resp));
          }
        }).catch(() => {});
        return cached;
      }
      /* Not cached — fetch from network */
      return fetch(event.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return resp;
      }).catch(() => {
        /* Offline fallback */
        if (event.request.destination === 'document') {
          return caches.match(BASE + '/index.html');
        }
      });
    })
  );
});

/* PUSH NOTIFICATIONS */
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Village Prime Feed Tool', {
      body: data.body || 'New update available',
      icon: BASE + '/icons/icon-192.png',
      badge: BASE + '/icons/icon-72.png',
      tag: 'vp-notification'
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(BASE + '/index.html')
  );
});
