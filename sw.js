const CACHE_NAME = 'umhp-v1';
const urlsToCache = [
  './',
  './logo.jpg'
];

// Installation et mise en cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Stratégie "Network First" : Cherche sur internet d'abord, sinon utilise le mode hors-ligne
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Nettoyage des anciennes versions si on met à jour
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
