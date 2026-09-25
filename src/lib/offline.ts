import type { LicenseId } from "@/lib/types";
import { setCount } from "./exam";
import { setKeysFor } from "./sets";
import { withBase } from "./basePath";

const PAGES = "ll-pages-v1";
const STATIC = "ll-static-v1";

/** Danh sách trang cần tải để học offline cho một hạng. */
export function offlineUrls(license: LicenseId) {
  const base = `/hang/${license.toLowerCase()}`;
  return [
    "/",
    "/bien-bao/",
    "/san-bien-bao/",
    "/tien-do/",
    "/lo-trinh/",
    `${base}/`,
    `${base}/bo-de/`,
    `${base}/thi-thu/`,
    `${base}/thu-thach/`,
    `${base}/diem-yeu/`,
    ...Array.from({ length: setCount(license) }, (_, i) => `${base}/bo-de/${i + 1}/`),
    ...setKeysFor(license).map((k) => `${base}/on-tap/${k}/`),
  ];
}

export function offlineSupported() {
  return typeof window !== "undefined" && "caches" in window && "serviceWorker" in navigator;
}

/** Tải và lưu các trang + tài nguyên vào bộ nhớ đệm. Gọi onProgress(0..1). */
export async function downloadForOffline(license: LicenseId, onProgress: (p: number) => void) {
  const urls = offlineUrls(license).map(withBase);
  const pages = await caches.open(PAGES);
  const stat = await caches.open(STATIC);
  const assets = new Set<string>();
  let done = 0;
  for (const u of urls) {
    try {
      const res = await fetch(u, { cache: "no-cache" });
      if (res.ok) {
        const html = await res.clone().text();
        await pages.put(u, res);
        for (const m of html.matchAll(/(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g)) assets.add(m[1]);
        // Dữ liệu điều hướng phía client (RSC): index.txt + các tệp __next.*.txt cùng thư mục.
        const rsc = new Set([`${u}index.txt`]);
        for (const m of html.matchAll(/"([^"]*__next\.[^"]*\.txt)"/g)) rsc.add(m[1].startsWith("/") ? m[1] : `${u}${m[1]}`);
        for (const r of rsc) {
          const txt = await fetch(r).catch(() => null);
          if (txt?.ok) await pages.put(r, txt);
        }
      }
    } catch {
      /* bỏ qua trang lỗi */
    }
    done++;
    onProgress((done / (urls.length + 1)) * 0.8);
  }
  const list = [...assets];
  let n = 0;
  for (const a of list) {
    if (!(await stat.match(a))) {
      const r = await fetch(a).catch(() => null);
      if (r?.ok) await stat.put(a, r);
    }
    n++;
    onProgress(0.8 + (n / Math.max(1, list.length)) * 0.2);
  }
  onProgress(1);
  return { pages: urls.length, assets: list.length };
}
