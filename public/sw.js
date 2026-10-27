/**
 * Ranvier service worker — install + offline support.
 *
 * Goals:
 *  1. Installed app opens offline (app shell: HTML + hashed chunks + fonts + brand).
 *  2. Data seen before stays readable offline (catalog, progress, attempt details).
 *  3. NEVER cache mutations — answers/submits/auth always go to the network
 *     (keeps server-side scoring and rate limiting intact).
 *
 * Strategies:
 *  - Navigation (always "/" — the app is hash-routed): network-first so new
 *    deploys are picked up; on failure, cached shell; last resort offline.html.
 *  - Build assets (/_next/static): cache-first ONLY when the response is
 *    immutable (Cache-Control: …immutable) — true in production where chunk
 *    URLs are content-hashed, false in `next dev` where URLs are reused across
 *    edits. This keeps dev mode always-fresh while production caches offline.
 *  - Brand assets (/brand, /icons, favicon, offline.html): cache-first always —
 *    stable files versioned by VERSION (bump it when changing them).
 *  - API GETs + /manifest.jsonl: stale-while-revalidate (instant offline reads,
 *    background refresh when online).
 *  - Everything else (POST/PUT/DELETE, cross-origin): untouched.
 *
 * Lifecycle: no skipWaiting on purpose — a study session / running exam in an
 * open tab must never be interrupted by an update; the new worker activates
 * only once all tabs are closed. clients.claim() lets the very first visit
 * take control (the page reloads once via the controllerchange listener in
 * pwa-provider.tsx so the initial load gets cached).
 */
const VERSION = "ranvier-v1.5.0";
const SHELL_CACHE = `ranvier-shell-${VERSION}`;
const ASSET_CACHE = `ranvier-assets-${VERSION}`;
const DATA_CACHE = `ranvier-data-${VERSION}`;
const NAV_SHELL_URL = "/";
const OFFLINE_URL = "/offline.html";

const PRECACHE = [
  OFFLINE_URL,
  "/favicon.svg",
  "/brand/noos-compact.svg",
  "/brand/noos-mark-negative.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const isBuildAsset = (pathname) => pathname.startsWith("/_next/static/");

const isBrandAsset = (pathname) =>
  pathname.startsWith("/brand/") ||
  pathname.startsWith("/icons/") ||
  pathname === "/favicon.svg" ||
  pathname === "/logo.svg" ||
  pathname === "/robots.txt";

const isDataUrl = (pathname) =>
  pathname.startsWith("/api/") ||
  pathname === "/manifest.jsonl" ||
  pathname === "/manifest.webmanifest";

const isImmutable = (response) => (response.headers.get("cache-control") ?? "").includes("immutable");

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Precache the shell safety-net entries one by one (best effort).
      await Promise.all(
        PRECACHE.map((url) =>
          cache.add(url).catch((err) => console.warn("[sw] precache miss:", url, err?.message ?? err))
        )
      );
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = [SHELL_CACHE, ASSET_CACHE, DATA_CACHE];
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Mutations and cross-origin requests: straight to the network.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (isDataUrl(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event, DATA_CACHE, request));
    return;
  }

  if (isBuildAsset(url.pathname) || isBrandAsset(url.pathname)) {
    event.respondWith(cacheFirst(ASSET_CACHE, request));
    return;
  }
  // Anything else: default network handling.
});

/** Navigations: fresh when online, cached shell when offline. */
async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(NAV_SHELL_URL, response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    const cached =
      (await caches.match(NAV_SHELL_URL, { cacheName: SHELL_CACHE })) ??
      (await caches.match(OFFLINE_URL, { cacheName: SHELL_CACHE }));
    if (cached) return cached;
    return new Response("Ranvier — offline", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

/**
 * Assets: serve from cache when present. Fresh responses are cached only when
 * safe to do so — immutable build chunks (production) or versioned brand files.
 * Dev-server responses (no-store) are never cached, so `next dev` stays fresh.
 */
async function cacheFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const url = new URL(request.url);
  const response = await fetch(request);
  if (
    response &&
    response.ok &&
    (isBrandAsset(url.pathname) || isImmutable(response))
  ) {
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

/** Data (API GETs, manifest.jsonl): cache if present + refresh in background. */
async function staleWhileRevalidate(event, cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    // Keep the background refresh alive past respondWith.
    event.waitUntil(network);
    return cached;
  }

  const fresh = await network;
  if (fresh) return fresh;

  return new Response(JSON.stringify({ error: "offline" }), {
    status: 503,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
