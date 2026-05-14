const CACHE_NAME = 'pdfminty-v2';
const DYNAMIC_CACHE = 'pdfminty-dynamic-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/pdf-worker.js',
  '/manifest.json',
  '/favicon.svg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use Cache-First for static assets
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Routing and Caching Strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Exclude API requests to Gemini Proxy or Netlify functions
  if (url.pathname.startsWith('/.netlify/functions/')) {
    // Network-only for Serverless endpoints
    return;
  }

  // 1. Cache-First for external CDN resources (unpkg, cdnjs, Google Fonts)
  if (url.origin === 'https://cdnjs.cloudflare.com' || url.origin === 'https://unpkg.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const resClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, resClone));
          return response;
        }).catch(() => {
          // Fallback if needed
        });
      })
    );
    return;
  }

  // 2. Stale-While-Revalidate for local JS/CSS chunks (Vite generated)
  if (url.origin === location.origin && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        }).catch(() => cachedResponse); // fallback to cache on offline

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Network-First fallback for HTML / other pages
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((response) => {
        return caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      }).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Generic fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});

// Background Sync Hook for future use (e.g., uploading telemetry/feedback when back online)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-feedback') {
    event.waitUntil(syncFeedbackData());
  }
});

async function syncFeedbackData() {
  console.log('[SW] Background Sync: Processing feedback queue');
  // Implementation will retrieve local feedback payloads and POST to /api/feedback
}
