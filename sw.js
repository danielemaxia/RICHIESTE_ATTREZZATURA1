const CACHE_NAME = 'richiesta-attrezzature-reset-20260427-1100';

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
        FILES_TO_CACHE.map(file => cache.add(file))
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

  // Non toccare richieste esterne
  if (url.origin !== self.location.origin) return;

  // Non toccare API, query di ricerca o URL con parametri
  if (url.search) return;

  // Per le pagine: prova internet, poi index offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Per file statici: prova internet, poi cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
