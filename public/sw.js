const CACHE_NAME = 'custody-clarity-v1';
const CORE_ROUTES = [
  '/',
  '/interview',
  '/result',
  '/directory',
  '/vault',
  '/settings',
  '/learn',
  '/next.svg',
  '/vercel.svg',
  '/globe.svg',
  '/file.svg',
  '/window.svg',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ROUTES)).then(() => self.skipWaiting())
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
  if (isApi(event.request)) {
    // network-first for APIs
    event.respondWith(
      fetch(event.request).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      }).catch(() => caches.match(event.request))
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

