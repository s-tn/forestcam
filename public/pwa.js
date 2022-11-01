

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
})

self.addEventListener('activate', function(event) {
  self.clients.claim();
})

self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    var cache = await caches.open('__neb');

    if (event.request.method=='GET') cache.add(event.request);

    return (await cache.match(event.request))||(await fetch(event.request));
  })());
})