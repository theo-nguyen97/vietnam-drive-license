import { BASE_PATH } from "./basePath";

/**
 * Địa chỉ công khai của web (dùng cho canonical, Open Graph, sitemap).
 * Đặt NEXT_PUBLIC_SITE_URL khi triển khai ở tên miền khác; mặc định là GitHub Pages.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || `https://theo-nguyen97.github.io${BASE_PATH}`).replace(/\/+$/, "");

export const SITE_NAME = "Lái Lụa";

export const SITE_DESCRIPTION =
  "Ôn tập và thi thử lý thuyết giấy phép lái xe Việt Nam (A1, A, B1, B, C1, C, D1, D2, D, BE, C1E, CE, D1E, D2E, DE) với sa hình động, bộ đề 2026 & 2027, giải thích chi tiết và lưu tiến độ học.";

/** Đường dẫn tuyệt đối (có tên miền) cho một trang trong web. */
export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetaInput = {
  title: string;
  description: string;
  /** Đường dẫn trang, có dấu "/" cuối (trailingSlash). */
  path: string;
  /** Màn hình tương tác (luyện tập, thi, mini game) — không đưa vào kết quả tìm kiếm. */
  noindex?: boolean;
};

/** Metadata chuẩn cho một trang: tiêu đề, mô tả, canonical và Open Graph. */
export function pageMeta({ title, description, path, noindex }: PageMetaInput) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
