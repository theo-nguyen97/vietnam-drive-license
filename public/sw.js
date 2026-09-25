/* Service worker của Lái Lụa — cho phép học khi không có mạng.
 * - Tài nguyên tĩnh (/_next/static, icon, font): cache-first (tên file có hash).
 * - Trang HTML: network-first, mất mạng thì dùng bản đã lưu.
 * - Dữ liệu điều hướng (.txt RSC), ảnh không có hash: stale-while-revalidate.
 * Tên cache gắn với mã bản build (?v= khi đăng ký) — bản build mới sẽ xoá cache của bản cũ.
 */
const VERSION = new URL(self.location.href).searchParams.get("v") || "v1";
const STATIC = `ll-static-${VERSION}`;
const PAGES = `ll-pages-${VERSION}`;
// Hỗ trợ triển khai dưới thư mục con (GitHub Pages): BASE = "/" hoặc "/<repo>/".
const BASE = new URL(self.registration.scope).pathname;
const CORE = [BASE, BASE + "manifest.webmanifest", BASE + "icons/icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(PAGES).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("ll-") && k !== STATIC && k !== PAGES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/** Tệp có hash trong tên — không bao giờ đổi nội dung. */
function isImmutable(url) {
  return url.pathname.startsWith(BASE + "_next/static/");
}

function put(cacheName, key, res) {
  return caches.open(cacheName).then((c) => c.put(key, res));
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (isImmutable(url)) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) e.waitUntil(put(STATIC, req, res.clone()));
            return res;
          }),
      ),
    );
    return;
  }

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) e.waitUntil(put(PAGES, url.pathname, res.clone()));
          return res;
        })
        .catch(async () => (await caches.match(url.pathname)) || (await caches.match(url.pathname + "/")) || (await caches.match(BASE)) || Response.error()),
    );
    return;
  }

  // Dữ liệu điều hướng phía client (RSC .txt), icon, ảnh, manifest: dùng bản đã lưu và cập nhật ngầm.
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      const net = fetch(req)
        .then((res) => {
          if (res.ok) e.waitUntil(put(PAGES, url.pathname, res.clone()));
          return res;
        })
        .catch(() => hit || Response.error());
      if (hit) e.waitUntil(net.catch(() => {}));
      return hit || net;
    }),
  );
});
