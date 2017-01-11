var cacheName   = 'onionite-cache-v1';
var offlineUrl  = '/no-connection';

// Install
self.addEventListener('install', function(event) {

  // Cache assets
  event.waitUntil(
    caches.open(cacheName)
      .then(function(cache) {
        return cache.addAll([
          offlineUrl,
          '/',
          '/about',
          '/assets/style.css',
          '/assets/enhancements.js?v2',
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

  // Try cache first for assets
  if(requestUrl.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {

          // If we don't have it make the request
          return response || fetch(event.request);
        }
      )
    );
    return;
  }

  // If we navigate to a page
  if (
    event.request.mode === 'navigate' ||
    (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))
  ) {
    event.respondWith(

      // Make the request
      fetch(event.request)
        .then(function(response) {

          // If it's the homepage or a node page
          if(requestUrl.pathname === '/' || requestUrl.pathname.startsWith('/node/')) {

            // Clone the response and read the html
            response.clone().text().then(function(html) {

              // Modify the html so we know when it was cached
              html = html.replace('window.cacheDate=false;', 'window.cacheDate="'+Date()+'";');
              var modifiedResponse = new Response(new Blob([html]), { headers: response.headers });

              // Cache the modified response
              caches.open(cacheName).then(function(cache) {
                cache.put(event.request, modifiedResponse);
              });
            });
          }

          // Always return the original response
          return response;
        })

        // If it fails
        .catch(function() {

          // Try and return a previously cached version
          return caches.match(event.request)
            .then(function(response) {

              // If we don't have a cached version show pretty offline page
              return response || caches.match(offlineUrl);
            });
        })
    );
  }
});
