const CACHE_NAME = 'umhp-v3'; // J'ai passé en v3 pour forcer le nettoyage de l'ancien cache
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './logo.jpg'
];

// Installation
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activation et nettoyage
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => {
        if (k !== CACHE_NAME) return caches.delete(k);
      })
    )).then(() => self.clients.claim())
  );
});

// Stratégie "Network First, fallback to Cache"
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // 1. Le téléphone capte internet : on met à jour le cache avec le code tout neuf
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // 2. Le téléphone n'a pas de réseau : on sert immédiatement la version en mémoire (hors-ligne garanti)
        return caches.match(event.request);
      })
  );
});
