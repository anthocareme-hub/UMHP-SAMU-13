const CACHE_NAME = 'umhp-v2';
const urlsToCache = [
  './',
  './manifest.json',
  './logo.jpg'
];

// Installation : mise en mémoire immédiate
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => {
        if (k !== CACHE_NAME) return caches.delete(k);
      })
    )).then(() => self.clients.claim())
  );
});

// Récupération instantanée depuis le cache, mise à jour en tâche de fond
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // 1. Si le fichier est en cache, on l'affiche immédiatement sans attendre la 4G
      if (cachedResponse) {
        // En parallèle, on tente de récupérer la dernière version sur le réseau en toute discrétion
        fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      // 2. Sinon, on va chercher sur le réseau
      return fetch(event.request);
    })
  );
});
