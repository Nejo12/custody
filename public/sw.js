const CACHE_NAME = 'custody-clarity-v2';
const CORE_ROUTES = [
  '/',
  '/interview',
  '/result',
  '/directory',
  '/vault',
  '/settings',
  '/learn',
  '/manifest.webmanifest',
  '/data/rules.json',
  '/data/directory.berlin.json',
  '/next.svg',
  '/vercel.svg',
  '/globe.svg',
  '/file.svg',
  '/window.svg',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ROUTES);
      // Precache Berlin directory
      try { await cache.add('/api/directory?city=berlin'); } catch {}
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
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
