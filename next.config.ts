import type { NextConfig } from "next";

// Khi triển khai lên GitHub Pages (https://<user>.github.io/<repo>/) đặt NEXT_PUBLIC_BASE_PATH=/<repo>.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

// Mã bản build: đổi tên cache của service worker mỗi lần build để xoá tài nguyên cũ.
const buildId = Date.now().toString(36);

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_BUILD_ID: buildId },
  // Xuất trang tĩnh: có thể triển khai lên bất kỳ static hosting nào (Vercel, Netlify, GitHub Pages...).
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
