// App-shell precache + runtime caching for visited content, so a previously-read topic still works
// offline. Deliberately does not cache Play Mode's three.js/vendor/scenes/models assets — that stays
// online-only, keeping the install light and in keeping with the site's "stay light, no bloat" ethos.
// Bump CACHE_VERSION when the app shell's own files change in a way that needs old caches cleared.
const CACHE_VERSION = "v1";
const SHELL_CACHE = `ai-base-shell-${CACHE_VERSION}`;
const CONTENT_CACHE = `ai-base-content-${CACHE_VERSION}`;

const SHELL_FILES = [
  "/", "/index.html", "/styles.css", "/main.js", "/nav.js", "/search.js", "/reader.js", "/cover.js", "/theme.js",
  "/benches/kit.js", // main.js imports this statically (not lazily, unlike a per-bench module), so it must
                     // be part of the shell: without it, the whole module fails to evaluate offline.
  "/favicon.svg", "/manifest.json"
];

self.addEventListener("install", (e) => {
  // content.json is precached too, not just runtime-cached below: main.js fetches it at module-eval
  // time, before this service worker has necessarily finished registering, so on a single visit it
  // would otherwise never pass through the fetch handler to get cached — a user who only ever visits
  // once before going offline would find nothing works. Precaching here means it is always available
  // from the very first install; the fetch handler's stale-while-revalidate still keeps it fresh after.
  e.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL_FILES)),
      caches.open(CONTENT_CACHE).then((c) => c.add("/content.json"))
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== CONTENT_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== "GET") return;

  if (SHELL_FILES.includes(url.pathname)) {
    // ignoreSearch: a navigation can carry a query string (?time=, ?mode=, ?debug) that the precached
    // shell entry, fetched without one, would otherwise fail to match.
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request)));
    return;
  }

  // content.json and per-topic bodies: stale-while-revalidate, so a visited topic reads offline and
  // still picks up new content the next time there is a connection.
  if (url.pathname === "/content.json" || url.pathname.startsWith("/content/")) {
    e.respondWith(
      caches.open(CONTENT_CACHE).then(async (cache) => {
        const hit = await cache.match(e.request);
        const network = fetch(e.request).then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => hit);
        return hit || network;
      })
    );
  }
});
