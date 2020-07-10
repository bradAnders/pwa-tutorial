const staticCacheName = "site-static-v1";
const dynamicCacheName = "site-dynamic-v1";
const assets = [
  '/',
  '/index.html',
  '/pages/fallback.html',
  '/js/app.js',
  '/js/ui.js',
  '/js/materialize.min.js',
  '/css/styles.css',
  '/css/materialize.min.css',
  '/img/dish.png',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v53/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
];

// Install service workers
self.addEventListener('install', e => {
  console.log('service worker has been installed');
  e.waitUntil(
    caches.open(staticCacheName).then(cache => {
        console.log('caching shell assets');
        cache.addAll(assets);
    }).catch(err => console.log(err))
  );
});

// Activate event
self.addEventListener('activate', e => {
  console.log('service worker has been activated');
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        .map(key => {
          console.log('deleting cache', key);
          caches.delete(key)
            .then(console.log(key, 'deleted'));
        })
      ).then(console.log('deleted old caches'))
    })
  );
});

// Fetch events
self.addEventListener('fetch', e => {
  // console.log('fetch event', e);
  e.respondWith(
    caches.match(e.request).then(cacheResponse => {
      return cacheResponse || fetch(e.request).then(fetchResponse => {
        return caches.open(dynamicCacheName).then(cache => {
          cache.put(e.request.url, fetchResponse.clone());
          console.log('dynamically cached', e.request.url);
          return fetchResponse;
        })
      });
    }).catch(err => caches.match('/pages/fallback.html'))
  );
});
