import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Xuất trang tĩnh: có thể triển khai lên bất kỳ static hosting nào (Vercel, Netlify, GitHub Pages...).
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
