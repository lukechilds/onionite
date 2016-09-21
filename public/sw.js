var cacheName = 'top-explorer-cache-v1';

// Install
self.addEventListener('install', function(event) {

  // Cache assets
  event.waitUntil(
    caches.open(cacheName)
      .then(function(cache) {
        return cache.addAll([
          '/assets/style.css',
          '/assets/enhancements.js',
          '/assets/iconfont.woff',
          '/assets/heart.svg'
        ]);
      })
  );
});

// Fetch
self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);

  // Only do stuff with our own urls
  if(requestUrl.origin !== location.origin) {
    return;
  }

  // Always check cache for assets
  if(requestUrl.pathname.startsWith('/assets/')) {
    checkCacheFirst(event);
    return;
  }
});

// Try cache first, if we don't have it make the request
function checkCacheFirst(event) {
  return event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
}
