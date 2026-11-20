/* Saves a copy of the LGA review meeting form on the phone so it opens without signal. */
const CACHE = 'lga-review-meeting-v1';
const SHELL = ['./', './index.html', './api.js'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Network first (so updates arrive), the saved copy when there's no signal.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const fromNetwork = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; });
    const timeout = new Promise(resolve => setTimeout(() => resolve(null), 4000));
    try { const res = await Promise.race([fromNetwork, timeout]); if (res) return res; } catch (e) { /* no signal */ }
    return (await cache.match(req, { ignoreSearch: true })) ||
           (req.mode === 'navigate' ? await cache.match('./index.html') : null) || fromNetwork;
  })());
});
