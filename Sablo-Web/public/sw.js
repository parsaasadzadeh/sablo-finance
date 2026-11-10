// نسخه را با هر تغییر مهم در استراتژی کش بالا ببر؛ کش‌های قدیمی (از جمله sablo-cache-v1) در activate پاک می‌شوند
const VERSION = "v2";
const STATIC_CACHE = `sablo-static-${VERSION}`;
const PAGES_CACHE = `sablo-pages-${VERSION}`;
const KEEP = [STATIC_CACHE, PAGES_CACHE];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(["/manifest.json"]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => !KEEP.includes(n)).map((n) => caches.delete(n))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // درخواست‌های API و هر دامنه‌ی دیگر هرگز کش نمی‌شوند (داده‌ی مالی همیشه تازه از سرور)
  if (url.origin !== self.location.origin) return;

  // ۱) صفحه‌ها: اول شبکه (تا بعد از دیپلوی نسخه‌ی جدید بیاید)، اگر آفلاین بود از کش
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(PAGES_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(async () => {
          const cache = await caches.open(PAGES_CACHE);
          return (
            (await cache.match(req)) ||
            (await cache.match("/")) ||
            new Response("آفلاین هستی. اتصال اینترنت را بررسی کن.", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        })
    );
    return;
  }

  // ۲) فایل‌های هش‌دار Next: تغییرناپذیر، پس اول کش
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res && res.status === 200) cache.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  // ۳) تصویر و فونت همین دامنه: کش فوری + به‌روزرسانی در پس‌زمینه
  if (req.destination === "image" || req.destination === "font") {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        const fresh = fetch(req)
          .then((res) => {
            if (res && res.status === 200) cache.put(req, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || fresh;
      })
    );
  }
  // هر چیز دیگر (مثل درخواست‌های RSC) مستقیم از شبکه
});
