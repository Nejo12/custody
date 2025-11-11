const CACHE_NAME = 'custody-clarity-v3';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icons/icon-192-maskable.png',
  '/icons/icon-512-maskable.png',
  '/icons/custody-clarity.png',
  // Preload directory endpoints for selected cities (best-effort)
  '/api/directory?city=berlin',
  '/api/directory?city=hamburg',
  '/api/directory?city=nrw'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cache each static asset individually to handle failures gracefully
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`Failed to cache ${asset}:`, err);
        }
      }
      // Precache Berlin directory API (optional, will be cached on first use)
      try {
        await cache.add('/api/directory?city=berlin');
      } catch (err) {
        console.warn(`Failed to cache /api/directory?city=berlin:`, err);
        // Silently fail - API will be cached on first fetch
      }
      // Don't skip waiting automatically - wait for user confirmation via message
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// Listen for messages from the client to skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function isApi(req) {
  return new URL(req.url).pathname.startsWith('/api/');
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const isContent = url.pathname.startsWith('/data/') || url.pathname.startsWith('/content/snapshots/');
  if (isApi(event.request)) {
    // Cache-first for directory; network-first otherwise
    if (url.pathname === '/api/directory') {
      event.respondWith(
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((res) => {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
            return res;
          });
        })
      );
      return;
    } else {
      event.respondWith(
        fetch(event.request).then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return res;
        }).catch(() => caches.match(event.request))
      );
      return;
    }
  }
  // Cache-first for content snapshots and data JSON
  if (isContent) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }
  // cache-first for others, with SWR
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
