// service-worker.js
// 这是用于生产环境的服务工作者脚本

const CACHE_NAME = 'ham-exam-v1';
const urlsToCache = [
  '/',
  '/logo.svg',
  '/manifest.json',
  '/index.html',
  '/robots.txt',
  '/sitemap.xml'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 返回缓存的资源或从网络获取
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // 检查请求是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 将副本添加到缓存
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});