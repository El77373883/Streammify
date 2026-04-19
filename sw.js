// sw.js - Streamify Offline Cache
const CACHE_NAME = 'streamify-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  '/precios.html',
  '/login.html',
  '/intro.html',
  'https://cdn.jsdelivr.net/npm/eruda',
  'https://cdn.jsdelivr.net/npm/localforage@1.10.0/dist/localforage.min.js'
];

// Instalación del SW
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Estrategia: Cache First, luego Network
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Si es un archivo de audio o video (Archive.org)
  if (requestUrl.hostname.includes('archive.org') || 
      requestUrl.pathname.endsWith('.mp3') ||
      requestUrl.pathname.endsWith('.mp4')) {
    
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          // Devolver de caché primero
          if (cachedResponse) {
            // Actualizar en segundo plano
            fetch(event.request).then(networkResponse => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
            }).catch(() => {});
            return cachedResponse;
          }
          
          // Si no está en caché, ir a red
          return fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
  } else {
    // Para el resto (HTML, CSS, JS)
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});

// Limpiar cachés viejas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
