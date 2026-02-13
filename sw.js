const CACHE_NAME = 'dotty-v2';
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://esm.sh/react@18.2.0',
  'https://esm.sh/react-dom@18.2.0/client',
  'https://esm.sh/lucide-react@0.263.1',
  'https://raw.githubusercontent.com/conizm/dotty/main/images/dotty_logo_favi.png',
  'https://conizm.cc/dotty/images/dotty_logo_yoko.png'
];

// インストール時にキャッシュを作成
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// アクティベート時に古いキャッシュを削除
self.addEventListener('activate', (event) => {
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

// ネットワーク優先（Network First）戦略
// まずネットワークから取得し、失敗したらキャッシュから取得
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ネットワークから取得成功 → キャッシュも更新
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // ネットワーク失敗 → キャッシュから取得（オフライン対応）
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // HTMLリクエストならindex.htmlをフォールバック
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
