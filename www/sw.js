const CACHE_NAME = 'gastos-app-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon.png',
  './assets/tailwind.js',
  './assets/fontawesome.js',
  './assets/chart.js',
  './assets/sweetalert2.js'
];

// 1. Instalación: Guardar archivos en la "Caja Fuerte" (Cache)
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Activación: Limpiar caches viejos si actualizas la versión
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
});

// 3. Interceptación: Cuando la app pide un archivo, dárselo desde el Cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});