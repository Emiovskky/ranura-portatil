// Ranura offline cache. It only manages its own caches: the game library and saves live in
// IndexedDB and are never touched here, so updating the app cannot erase them.
const VERSION = '8d2649eddbda';
const CACHE = 'ranura-app-' + VERSION;
const FONTS = 'ranura-fonts';
const ASSETS = ["./","index.html","manifest.webmanifest","icons/icon-180.png","icons/icon-192.png","icons/icon-512.png","core/mgba.js","core/mgba.wasm","core/mgba.sdk.js","core/mgba.config.js","core/mgba.options.js","core/mgba.manifest.js","core/mgba.zip.js","core/mgba-sink.js"];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ranura-app-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate') {
      // Fresh page when online (so updates arrive), cached page when offline or slow.
      event.respondWith(
        Promise.race([fetch(req), timeout(4000)])
          .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('index.html', copy)); return res; })
          .catch(() => caches.match('index.html', { ignoreSearch: true })),
      );
      return;
    }
    event.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(caches.open(FONTS).then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req).then((res) => { c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
