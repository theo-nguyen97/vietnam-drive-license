import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lái Lụa — Ôn thi bằng lái như chơi game",
    short_name: "Lái Lụa",
    description: "Ôn tập, thi thử lý thuyết GPLX với sa hình động, bộ đề 2026 và chẩn đoán điểm yếu.",
    lang: "vi",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0d12",
    theme_color: "#0b0d12",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
