const CACHE_NAME = "thedayboard-shell-v9";
const APP_SHELL = [
  "/",
  "/index.html",
  "/home.css?v=1",
  "/laundry.html",
  "/curriculum.html",
  "/mess-menu.html",
  "/bus-timings.html",
  "/campus-map.html",
  "/surveys.html",
  "/clubs.html",
  "/about.html",
  "/styles.css?v=20261022",
  "/nav-rail.css?v=1",
  "/nav.js?v=20261025",
  "/brand.js?v=20261021",
  "/curriculum.js",
  "/sgpa.js",
  "/service-tables.js",
  "/section-visibility.js?v=20261016",
  "/traffic.js",
  "/surveys.js?v=3",
  "/surveys.css?v=2",
  "/surveys-extra.css?v=2",
  "/clubs.js?v=1",
  "/clubs.css?v=1",
  "/manifest.webmanifest",
  "/assets/ethers-club-icon.png",
  "/assets/ethers-club-logo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/index.html"))),
  );
});
