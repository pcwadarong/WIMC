// WIMC 최소 서비스워커 — 오프라인 셸 (네트워크 우선 + 실패 시 캐시 폴백)
const CACHE = "wimc-v1";
const FALLBACK = "/welcome"; // 오프라인 폴백(공개 셸)

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add(FALLBACK)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // 페이지 이동만 처리 (API/인증/POST는 건드리지 않음)
  if (req.method !== "GET" || req.mode !== "navigate") return;

  event.respondWith(
    fetch(req).catch(() =>
      caches.match(req).then((hit) => hit || caches.match(FALLBACK)),
    ),
  );
});
