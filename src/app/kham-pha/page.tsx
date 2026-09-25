import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { ExploreGrid } from "@/components/explore/ExploreGrid";

export const metadata: Metadata = pageMeta({
  title: "Khám phá",
  description: "Lộ trình lấy bằng, thư viện biển báo, mini game săn biển báo, thử thách 12 điểm, phân tích điểm yếu và bằng lái ảo.",
  path: "/kham-pha/",
});

export default function ExplorePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <h1 className="font-display text-3xl text-white">Khám phá</h1>
        <p className="mb-6 mt-1 text-white/60">Công cụ, mini game và hướng dẫn thực hành ngoài phần ôn lý thuyết.</p>
        <ExploreGrid />
      </main>
      <Footer />
    </>
  );
}
