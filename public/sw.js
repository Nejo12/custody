const CACHE_NAME = 'custody-clarity-v4';
const STATIC_ASSETS = [
  // NOTE: Removed '/' - we should NOT cache HTML pages
  // HTML pages must come from network to avoid hydration errors
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

/**
 * Check if request is for an HTML page
 * HTML pages should NEVER be cached to prevent hydration errors
 * when old HTML tries to hydrate with new React code
 */
function isHtml(request) {
  // Navigation requests are always HTML pages
  if (request.mode === 'navigate') return true;
  // Check if it's a same-origin request that might be HTML
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  // If it's not an API, data, or Next.js asset, it's likely HTML
  return (
    !url.pathname.startsWith('/api/') &&
    !url.pathname.startsWith('/data/') &&
    !url.pathname.startsWith('/content/') &&
    !url.pathname.startsWith('/_next/') &&
    !url.pathname.startsWith('/icons/') &&
    !url.pathname.includes('.')
  );
}

/**
 * Check if request is for Next.js assets
 * Next.js assets are versioned and should NEVER be cached
 * to prevent mismatches between HTML and JS bundles
 */
function isNextAsset(url) {
  return url.pathname.startsWith('/_next/');
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  
  // CRITICAL: Don't intercept Next.js assets at all
  // Let the browser handle them natively to avoid ERR_FAILED errors
  // when chunks are missing or network fails
  // We don't cache them anyway, so no need to intercept
  if (isNextAsset(url)) {
    // Don't intercept - let browser handle natively
    return;
  }
  
  // CRITICAL: Never cache HTML pages
  // This prevents hydration errors when old HTML tries to hydrate with new React code
  if (isHtml(event.request)) {
    // Network-first for HTML - NEVER cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Don't cache HTML
          return response;
        })
        .catch(() => {
          // Only use cache as offline fallback for HTML
          return caches.match(event.request);
        })
    );
    return;
  }
  
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
