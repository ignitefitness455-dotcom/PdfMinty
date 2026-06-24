/**
 * PdfMinty Service Worker.
 *
 * Strategy:
 * - Static hashed assets (JS/CSS/fonts/images with /assets/* path or hashed filenames):
 *   cache-first, stale-while-revalidate. These are immutable so safe to cache.
 * - HTML navigations: network-first with cached /index.html fallback. This
 *   gives users up-to-date HTML on reload while still working offline.
 * - Everything else (including PDFs, blob:, data:): bypass cache entirely.
 *   PDF blobs must NEVER be cached — they can be hundreds of MB and would
 *   blow the cache quota.
 *
 * Cache version is bumped on every build via the VITE_SW_VERSION env var.
 * In development this defaults to 'dev'.
 */

const CACHE_VERSION = self.__SW_VERSION__ || 'dev-' + Date.now();
const STATIC_CACHE = `pdfminty-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `pdfminty-runtime-${CACHE_VERSION}`;

// Only cache GET requests to same-origin assets that match these patterns.
const STATIC_ASSET_PATTERN = /\.(?:js|css|woff2?|ttf|otf|svg|png|jpg|jpeg|webp|avif|gif|ico|map)$/i;
const STATIC_PATH_PATTERN = /^\/(?:assets|fonts|icons)\//i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(['/index.html', '/manifest.json', '/logo.svg']))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !key.endsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET. POST/PUT/etc always go to network.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Same-origin only. Cross-origin (e.g. googleapis.com) bypasses SW.
  if (url.origin !== self.location.origin) return;

  // Never cache blob: or data: URLs (these include PDF blob URLs created
  // for download links — caching them would blow the quota).
  if (url.protocol === 'blob:' || url.protocol === 'data:') return;

  // Never cache API requests.
  if (url.pathname.startsWith('/api/')) return;

  // Never cache PDF responses — critical for a PDF-tool site.
  if (url.pathname.toLowerCase().endsWith('.pdf')) return;

  // Navigation requests (HTML page loads): network-first with /index.html fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put('/index.html', fresh.clone()).catch(() => {});
          return fresh;
        } catch {
          const cache = await caches.open(RUNTIME_CACHE);
          const cached = await cache.match('/index.html');
          return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
        }
      })()
    );
    return;
  }

  // Static hashed assets: cache-first, revalidate in background.
  const isStaticAsset =
    STATIC_ASSET_PATTERN.test(url.pathname) || STATIC_PATH_PATTERN.test(url.pathname);
  if (isStaticAsset) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone()).catch(() => {});
            }
            return response;
          })
          .catch(() => null);
        return cached || fetchPromise || new Response('Offline', { status: 503 });
      })()
    );
    return;
  }

  // Everything else: just go to network.
});

// Allow page to trigger immediate activation on update.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
