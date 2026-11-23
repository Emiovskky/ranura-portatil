// Ranura offline cache. It only manages its own caches: the game library and saves live in
// IndexedDB and are never touched here, so updating the app cannot erase them.
const VERSION = 'ec1fafa594e1';
const CACHE = 'ranura-app-' + VERSION;
const FONTS = 'ranura-fonts';
// The PSP engine (~15 MB) is cached the first time the PSP page uses it, not at install.
const PSP_CACHE = 'ranura-psp-4.2.3';
const ASSETS = ["./","index.html","psp.html","manifest.webmanifest","icons/icon-180.png","icons/icon-192.png","icons/icon-512.png","core/mgba.js","core/mgba.wasm","core/mgba.sdk.js","core/mgba.config.js","core/mgba.options.js","core/mgba.manifest.js","core/mgba.zip.js","core/mgba-sink.js"];

// psp.html needs SharedArrayBuffer, which browsers only allow on cross-origin isolated pages.
// Static hosts cannot send those headers, so the worker adds them to that page.
function isolate(res) {
  const headers = new Headers(res.headers);
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => (k.startsWith('ranura-app-') && k !== CACHE) || (k.startsWith('ranura-psp-') && k !== PSP_CACHE)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Everything the PSP engine needs is hosted here; its update check and CDN fallback stay local.
  if (url.hostname === 'cdn.emulatorjs.org') {
    event.respondWith(new Response('', { status: 404 }));
    return;
  }
  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate' && url.pathname.endsWith('/psp.html')) {
      event.respondWith(
        Promise.race([fetch(req), timeout(4000)])
          .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('psp.html', copy)); return res; })
          .catch(() => caches.match('psp.html', { ignoreSearch: true }))
          .then(isolate),
      );
      return;
    }
    if (url.pathname.includes('/psp/ejs/')) {
      event.respondWith(caches.open(PSP_CACHE).then(async (c) => {
        const hit = await c.match(req, { ignoreSearch: true });
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok && req.method === 'GET') c.put(req, res.clone());
        return res;
      }));
      return;
    }
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
