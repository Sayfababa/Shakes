// Code: network-first (Updates kommen sofort an). Bilder: aus dem Cache, im Hintergrund aktualisieren.
const C = 'aschenkrone-v3';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const put = r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(req, cp)); } return r; };
  if (/\.(jpe?g|png|webp|m4a)$/i.test(new URL(req.url).pathname)) {
    e.respondWith(caches.match(req).then(hit => { const net = fetch(req).then(put).catch(() => hit); return hit || net; }));
    return;
  }
  // no-cache: beim Server nachfragen statt 10 Min. aus dem Browser-Speicher (GitHub Pages: max-age=600)
  e.respondWith(fetch(req, { cache: 'no-cache' }).then(put).catch(() => caches.match(req)));
});
