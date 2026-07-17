// Service Worker — Consultor de Fila (v6 — stats por planilha)
const CACHE = 'fila-consulado-v6';
const CORE = ['./', './index.html', './icon-192.png', './icon-512.png', './icon-512-maskable.png', './manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const q = e.request;
  if (q.method !== 'GET') return;
  const u = new URL(q.url);
  if (u.origin !== self.location.origin) return;

  const p = u.pathname;
  const isHTML = p === '/' || p.endsWith('/') || p.endsWith('/index.html');
  const isData = p.endsWith('/dados.json') || p.endsWith('/insights.json');

  // HTML e dados dinâmicos: SEMPRE rede primeiro, sem cache velho.
  if (isHTML || isData) {
    e.respondWith(
      fetch(q, { cache: 'no-store' })
        .catch(() => caches.match(q).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Demais assets (ícones, etc.): rede primeiro, atualizando o cache.
  e.respondWith(
    fetch(q).then(r => {
      const c = r.clone();
      caches.open(CACHE).then(x => x.put(q, c)).catch(() => {});
      return r;
    }).catch(() => caches.match(q).then(r => r || caches.match('./index.html')))
  );
});
