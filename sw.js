const CACHE_NAME = 'aminas-pwa-v15';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icono.png',
  './js/main.js',
  './js/core/catalogoMedicamentos.js',
  './js/core/calculoFisiologico.js',
  './js/core/agendaService.js',
  './js/core/authService.js',
  './js/core/permisosService.js',
  './js/core/historialService.js',
  './js/data/storageRepository.js',
  './js/ui/dashboardView.js',
  './js/ui/modalReporteView.js',
  './js/ui/citasView.js',
  './js/ui/authView.js',
  './js/ui/historialView.js',
  './js/controllers/dashboardController.js',
  './js/controllers/calculadoraController.js',
  './js/controllers/reporteController.js',
  './js/controllers/citasController.js',
  './js/controllers/historialController.js',
  './js/controllers/authController.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve el archivo en caché si existe, sino lo busca en la red.
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
