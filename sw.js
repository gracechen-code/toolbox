const CACHE_NAME = 'toolbox-v6';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './pages/stopwatch.html',
    './pages/timer.html',
    './pages/counter.html',
    './pages/hex-ascii.html',
    './pages/qrcode.html',
    './js/stopwatch.js',
    './js/timer.js',
    './js/counter.js',
    './js/hex-ascii.js',
    './js/qrcode.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) =>
            response || fetch(e.request).catch(() => caches.match('./index.html'))
        )
    );
});
