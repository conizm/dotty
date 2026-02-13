const CACHE_NAME = 'dotty-v3';
const urlsToCache = [
  '/dotty/',
  '/dotty/index.html',
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
  // GETリクエストのみ処理（POST/PUTなどは通常通り）
  if (event.request.method !== 'GET') {
    return;
  }
  
  // ナビゲーションリクエスト（ページ遷移）のみ処理
  // これにより、入力欄に関連するリクエストが妨げられない
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // ネットワークから取得成功 → キャッシュも更新
          if (response && response.status === 200 && response.type === 'basic') {
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
            return caches.match('/dotty/index.html');
          });
        })
    );
    return;
  }
  
  // 静的アセット（JS、CSS、画像など）のみキャッシュ処理
  const url = new URL(event.request.url);
  const isStaticAsset = event.request.destination === 'script' || 
                        event.request.destination === 'style' ||
                        event.request.destination === 'image' ||
                        event.request.destination === 'font' ||
                        urlsToCache.some(cacheUrl => url.href.includes(cacheUrl));
  
  if (isStaticAsset) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
  // その他のリクエスト（XHR、fetch APIなど）は通常通り処理され、Service Workerは介入しない
});
