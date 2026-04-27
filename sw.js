const CACHE_NAME = 'richiesta-attrezzature-nuovi-articoli-20260427-1200';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icone/icon-192.png',
  './icone/icon-512.png',
  './apple-touch-icon.png',
  './favicon-32.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        FILES_TO_CACHE.map(file => cache.add(file + '?v=20260427-1200'))
      );
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  // MAI cache per ricerche o richieste con parametri
  if (url.search) return;

  // HTML sempre dalla rete, cache solo se offline
  if (
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('/index.html')
  ) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => response)
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // JS, CSS, JSON: sempre dalla rete, fallback cache se offline
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.json')
  ) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => response)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Immagini e icone: cache ok
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
