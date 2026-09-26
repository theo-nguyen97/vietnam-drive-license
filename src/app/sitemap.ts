import type { MetadataRoute } from "next";
import { LICENSES } from "@/data/licenses";
import { NEWS } from "@/data/news";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

/** Đổi "dd/mm/yyyy" → Date (dùng cho lastModified của bài viết). */
function parseDate(s: string) {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Chỉ liệt kê các trang có nội dung tĩnh. Các màn hình luyện tập / thi / mini game
 * chạy hoàn toàn phía trình duyệt và được đánh dấu noindex.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const newest = NEWS.map((n) => parseDate(n.date)).sort((a, b) => b.getTime() - a.getTime())[0];
  const fixed: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: newest, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/gioi-thieu/"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/tin-tuc/"), lastModified: newest, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/bien-bao/"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/lo-trinh/"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/kham-pha/"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/hoc-meo/"), changeFrequency: "monthly", priority: 0.8 },
  ];
  const licenses: MetadataRoute.Sitemap = LICENSES.flatMap((l) => {
    const id = l.id.toLowerCase();
    return [
      { url: absoluteUrl(`/hang/${id}/`), changeFrequency: "weekly" as const, priority: 0.9 },
      { url: absoluteUrl(`/hang/${id}/bo-de/`), changeFrequency: "monthly" as const, priority: 0.6 },
    ];
  });
  const news: MetadataRoute.Sitemap = NEWS.map((n) => ({
    url: absoluteUrl(`/tin-tuc/${n.slug}/`),
    lastModified: parseDate(n.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  return [...fixed, ...licenses, ...news];
}
