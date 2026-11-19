// KSC ERP 서비스워커 — 빌드 20261119-160832
// 앱·자료(index/meta/data)는 네트워크 우선(최신 반영), 사진(img/*.bin, 내용해시 파일명)은 캐시 우선. 오프라인이면 캐시로.
const CACHE = "ksc-recipe-v1";
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.includes("/img/")) {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const r = await fetch(e.request);
      if (r.ok) c.put(e.request, r.clone());
      return r;
    }));
    return;
  }
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const keyReq = url.pathname.endsWith("data.bin") ? new Request(url.origin + url.pathname) : e.request;
    try {
      const r = await fetch(e.request, { cache: "no-store" });
      if (r.ok) c.put(keyReq, r.clone());
      return r;
    } catch (err) {
      const hit = await c.match(keyReq, { ignoreSearch: true });
      if (hit) return hit;
      throw err;
    }
  })());
});
