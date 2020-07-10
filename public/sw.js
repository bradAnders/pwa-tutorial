const version = "7";
const staticCacheName = "site-static-v" + version;
const dynamicCacheName = "site-dynamic-v" + version;
const dynamicCacheSizeLimit = 15;
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
  '/manifest.json',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v53/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
];

// Cache size limit
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length >  size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size))
      }
    })
  })
};

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

  if (e.request.url.indexOf('firestore.googleapis.com') === -1) {
    e.respondWith(
      caches.match(e.request).then(cacheResponse => {
        return cacheResponse || fetch(e.request).then(fetchResponse => {
          return caches.open(dynamicCacheName).then(cache => {
            cache.put(e.request.url, fetchResponse.clone());
            limitCacheSize(dynamicCacheName, dynamicCacheSizeLimit);
            console.log('dynamically cached', e.request.url);
            return fetchResponse;
          })
        });
      }).catch(err => {
        if (e.request.url.indexOf('.html') > -1) {
          return caches.match('/pages/fallback.html');
        }
      })
    );
  }
});
