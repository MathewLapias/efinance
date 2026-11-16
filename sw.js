/* eFinance — service worker: membuat aplikasi bisa dibuka cepat dan tetap tampil saat offline.
   Naikkan angka VERSI setiap kali kamu mengunggah index.html yang baru. */
const VERSI = 'efinance-v1';
const INTI = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-180.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(INTI)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(daftar => Promise.all(daftar.filter(k => k !== VERSI).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // kiriman data ke Apps Script tidak pernah disimpan
  const url = new URL(req.url);
  const font = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  const sendiri = url.origin === self.location.origin;
  if (!sendiri && !font) return;

  e.respondWith(caches.open(VERSI).then(async cache => {
    const tersimpan = await cache.match(req, { ignoreSearch: sendiri && req.mode === 'navigate' });
    const dariJaringan = fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    }).catch(() => tersimpan);
    return tersimpan || dariJaringan;                     // tampil seketika, diperbarui di latar
  }));
});
