const CACHE_NAME = "dayboard-shell-v3";
const APP_SHELL = [
  "/",
  "/index.html",
  "/curriculum.html",
  "/mess-menu.html",
  "/bus-timings.html",
  "/campus-map.html",
  "/surveys.html",
  "/about.html",
  "/styles.css?v=20261014",
  "/nav.js?v=20261022",
  "/curriculum.js",
  "/sgpa.js",
  "/service-tables.js",
  "/section-visibility.js?v=20261016",
  "/traffic.js",
  "/surveys.js?v=3",
  "/surveys.css?v=1",
  "/surveys-extra.css?v=2",
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
