const CACHE_NAME = 'streamify-v4';

const urlsToCache = [
  '/index.html',
  '/admin.html',
  '/create-cuenta-free.html',
  '/intro.html',
  '/login.html',
  '/precios.html',
  '/premium.html',
  '/planes.html',
  '/manifest.json',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache).catch(() => {}))
  );
});

self.addEventListener('activate', event => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignorar todo lo externo
  if (url.origin !== location.origin) return;

  // Solo cachear páginas propias
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => cached);
    })
  );
});
