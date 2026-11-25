// Guarda o app no aparelho para abrir sem internet. Ao mudar arquivos, troque a versão.
const CACHE = 'viagem-rv-v12';
const FILES = ['./', './index.html', './manifest.webmanifest', './seed.js', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './xlsx.full.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Com internet: busca a versão nova e atualiza a cópia. Sem internet: usa a cópia.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      // Só guarda e usa respostas boas; se o site der erro (ex.: 404), fica com a cópia salva.
      if (!r.ok && r.type !== 'opaque') return caches.match(e.request, { ignoreSearch: true }).then(c => c || r);
      const cp = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, cp));
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
