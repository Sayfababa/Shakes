// Code: network-first (Updates kommen sofort an). Bilder: aus dem Cache, im Hintergrund aktualisieren.
const C = 'aschenkrone-v2';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const put = r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(req, cp)); } return r; };
  if (/\.(jpe?g|png|webp)$/i.test(new URL(req.url).pathname)) {
    e.respondWith(caches.match(req).then(hit => { const net = fetch(req).then(put).catch(() => hit); return hit || net; }));
    return;
  }
  e.respondWith(fetch(req).then(put).catch(() => caches.match(req)));
});
