// ???붾㈃??異붽??덉쓣 ???깆쿂???대━寃??섎뒗 理쒖냼?쒖쓽 ?쒕퉬???뚯빱. ?붾㈃ ?뚯씪留?蹂닿??섍퀬, ?먮즺??蹂닿??섏? ?딅뒗??
const CACHE = "planner-v215";
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "index.html", "manifest.webmanifest", "icon-192.png"])).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
