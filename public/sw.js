const CACHE_NAME = 'apexplanet-static-v1.0.0';
const DYNAMIC_CACHE = 'apexplanet-dynamic-v1.0.0';
const COINGECKO_CACHE_TTL = 60 * 1000; // 60 seconds

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/tasks/task1-kanban.html',
  '/tasks/task2-video-player.html',
  '/tasks/task3-expense-tracker.html',
  '/tasks/task4-chat.html',
  '/tasks/task5-dashboard.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Stale-While-Revalidate for CoinGecko API
  if (url.hostname.includes('api.coingecko.com')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const headers = new Headers(networkResponse.headers);
              headers.set('x-sw-cached-at', Date.now().toString());
              const clonedResponse = new Response(networkResponse.clone().body, {
                status: networkResponse.status,
                statusText: networkResponse.statusText,
                headers
              });
              cache.put(event.request, clonedResponse);
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        if (cachedResponse) {
          const cachedTime = cachedResponse.headers.get('x-sw-cached-at');
          const isStale = !cachedTime || (Date.now() - parseInt(cachedTime, 10)) > COINGECKO_CACHE_TTL;
          if (isStale) {
            // Revalidate in background and return cache
            fetchPromise;
          }
          return cachedResponse;
        }

        return fetchPromise;
      })
    );
    return;
  }

  // Cache-First for static assets (/assets/, .css, .js, .png, .svg)
  if (
    url.pathname.startsWith('/assets/') ||
    event.request.destination === 'style' ||
    event.request.destination === 'script' ||
    event.request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, resClone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Network-First for navigations / HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match(event.request);
        return cached || caches.match('/index.html');
      })
    );
    return;
  }

  // Default fetch
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
});
