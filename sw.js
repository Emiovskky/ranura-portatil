// Ranura offline cache. It only manages its own caches: the game library and saves live in
// IndexedDB and are never touched here, so updating the app cannot erase them.
const VERSION = 'e42fa809474b';
const CACHE = 'ranura-app-' + VERSION;
const FONTS = 'ranura-fonts';
// The PSP engine (~15 MB) is cached the first time the PSP page uses it, not at install.
const PSP_CACHE = 'ranura-psp-4.2.3';
const ASSETS = ["./","index.html","psp.html","consola.html","ps2.html","manifest.webmanifest","icons/icon-180.png","icons/icon-192.png","icons/icon-512.png","core/mgba.js","core/mgba.wasm","core/mgba.sdk.js","core/mgba.config.js","core/mgba.options.js","core/mgba.manifest.js","core/mgba.zip.js","core/mgba-sink.js"];

// psp.html needs SharedArrayBuffer, which browsers only allow on cross-origin isolated pages.
// Static hosts cannot send those headers, so the worker adds them to that page.
function isolate(res) {
  const headers = new Headers(res.headers);
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

// Games live in the shelf's IndexedDB as Blobs (on disk). The worker keeps a handle to the one in use
// and returns only the requested slice, so the page never holds a whole disc in memory.
const discs = new Map();
async function discBlob(id) {
  if (discs.has(id)) return discs.get(id);
  const db = await new Promise((res, rej) => { const r = indexedDB.open('ranura'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  try {
    if (!db.objectStoreNames.contains('roms')) return null;
    const blob = await new Promise((res, rej) => { const g = db.transaction('roms').objectStore('roms').get(id); g.onsuccess = () => res(g.result); g.onerror = () => rej(g.error); });
    if (!(blob instanceof Blob)) return null;
    if (discs.size > 2) discs.clear();
    discs.set(id, blob);
    return blob;
  } finally { db.close(); }
}
async function discPiece(url) {
  try {
    const blob = await discBlob(url.pathname.split('/').pop());
    if (!blob) return new Response('', { status: 404 });
    const offset = Math.max(0, Number(url.searchParams.get('o')) || 0);
    const length = Math.min(Math.max(0, Number(url.searchParams.get('n')) || 0), 8 * 1024 * 1024);
    return new Response(blob.slice(offset, offset + length), { headers: { 'content-type': 'text/plain; charset=x-user-defined', 'cache-control': 'no-store' } });
  } catch (e) {
    return new Response('', { status: 500 });
  }
}

self.addEventListener('install', (event) => {
  // 'reload': take the files from the server, not from the browser's own HTTP cache (which may be minutes old)
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
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
  // A game being played asks for one piece of its file at a time (see consola.html).
  if (url.origin === self.location.origin && /\/disc\/[a-z0-9]+$/i.test(url.pathname)) {
    event.respondWith(discPiece(url));
    return;
  }
  // Everything the PSP engine needs is hosted here; its update check and CDN fallback stay local.
  if (url.hostname === 'cdn.emulatorjs.org') {
    event.respondWith(new Response('', { status: 404 }));
    return;
  }
  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate' && /\/(psp|consola|ps2)\.html$/.test(url.pathname)) {
      const page = url.pathname.split('/').pop();
      event.respondWith(
        Promise.race([fetch(req.url, { cache: 'no-cache' }), timeout(4000)])
          .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(page, copy)); return res; })
          .catch(() => caches.match(page, { ignoreSearch: true }))
          .then(isolate),
      );
      return;
    }
    if (url.pathname.includes('/ps2/')) {
      // The PS2 engine starts its threads from Play.js itself, so its files must carry the isolation headers too.
      event.respondWith(caches.open(PSP_CACHE).then(async (c) => {
        let res = await c.match(req, { ignoreSearch: true });
        if (!res) { res = await fetch(req); if (res.ok) c.put(req, res.clone()); }
        return isolate(res);
      }));
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
        Promise.race([fetch(req.url, { cache: 'no-cache' }), timeout(4000)])
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
