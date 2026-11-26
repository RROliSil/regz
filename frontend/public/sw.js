// Service Worker para Regz - Gestão de Pessoas (Network-First HTML + SWR Assets Versionados)
const CACHE_NAME = 'regz-assets-v2';

// Recursos estáticos essenciais para pré-cache
const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.ico',
  '/favicon.png',
  '/favicon.svg',
  '/logo.png',
  '/logo.svg',
  '/videos/poster_start.png'
];

// Instalação do Service Worker e ativação imediata
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pré-cache parcial:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza automática de caches antigos (ex: regz-assets-v1)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação: Network-Only para /api/, Network-First para navegações HTML e SWR para assets estáticos
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Requisições externas, rotas /api/ ou métodos não-GET passam direto pela rede
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api') || request.method !== 'GET') {
    return;
  }

  // Navegações HTML (SPA) e index.html: Network-First para garantir deploys imediatos sem cache stale
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Assets estáticos (JS/CSS com hash do Vite, imagens, fontes): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
