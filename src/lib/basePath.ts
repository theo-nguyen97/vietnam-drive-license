/** Tiền tố đường dẫn khi triển khai dưới thư mục con (ví dụ GitHub Pages: /vietnam-drive-license). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Thêm tiền tố cho đường dẫn tuyệt đối dùng với fetch / Cache API. */
export function withBase(path: string) {
  return `${BASE_PATH}${path}`;
}
