/* Service worker LaporBantu Smadita
 * - Halaman dan ikon disimpan di cache saat aplikasi pertama dibuka.
 * - Saat online, halaman selalu diambil dari jaringan, jadi pembaruan langsung terlihat.
 * - Saat offline, halaman dan ikon diambil dari cache.
 * - Permintaan ke server (POST ke Apps Script) tidak pernah disimpan di cache. */

const VERSI_CACHE = 'laporbantu-v3';
const BERKAS_INTI = [
  './',
  './index.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSI_CACHE)
      .then(cache => cache.addAll(BERKAS_INTI))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(nama => Promise.all(nama.filter(n => n !== VERSI_CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  // Hanya berkas GET dari domain yang sama yang disimpan. Permintaan lain dibiarkan lewat.
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const salinan = res.clone();
          caches.open(VERSI_CACHE).then(cache => cache.put(req, salinan));
        }
        return res;
      })
      .catch(() => caches.match(req).then(hasil => hasil || caches.match('./index.html')))
  );
});
