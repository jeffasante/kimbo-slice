// Service worker (template; vite.config.ts fills in the precache list and
// version at build time). App shell is cache-first; presets.json is
// network-first so updated limits arrive when online, cached copy offline.

const PRECACHE = ["./","./assets/__vite-browser-external-Bb3ttd7v.js","./assets/index-CeFATLCZ.js","./assets/index-dxDR-I3I.css","./assets/kimbo_slice-BB43vZdC.wasm","./assets/worker-2LMrVxuT.js","./presets.json","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png"];
const CACHE = `kimbo-slice-${"8249ba2b5d2e"}`;

self.addEventListener('install', (event) => {
  // cache: 'reload' skips the HTTP cache: GitHub Pages sends max-age=600, so
  // a plain addAll can store the previous deploy's index.html in a new cache.
  event.waitUntil(caches.open(CACHE).then((c) =>
    c.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('kimbo-slice-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith('/presets.json')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const res = await fetch(req, { cache: 'no-cache' });
        if (res.ok) await cache.put(req, res.clone());
        return res;
      } catch (err) {
        const hit = await cache.match(req, { ignoreSearch: true });
        if (hit) return hit;
        throw err;
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = req.mode === 'navigate' ? new URL('./', self.registration.scope).href : req;
    const hit = await cache.match(key, { ignoreSearch: req.mode === 'navigate' });
    return hit || fetch(req);
  })());
});
