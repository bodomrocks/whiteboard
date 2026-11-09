// Offline-Speicher: Die App läuft nach dem ersten Laden auch ohne Internet.
// Neue Versionen werden im Hintergrund geladen und beim nächsten Start aktiv.
const CACHE = "whiteboard-8becb9431d";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const key = url.pathname.endsWith("/") ? "./" : e.request;
    const cached = await cache.match(key, { ignoreSearch: true });
    const fresh = fetch(e.request).then((r) => { if (r.ok) cache.put(key, r.clone()); return r; }).catch(() => cached);
    return cached || fresh;
  }));
});
