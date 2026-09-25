import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { JourneyPage } from "@/components/journey/JourneyPage";

export const metadata: Metadata = pageMeta({
  title: "Lộ trình lấy bằng lái & hướng dẫn sa hình thực hành",
  description: "Các bước từ đăng ký, khám sức khỏe, học, thi lý thuyết, thực hành đến nhận bằng; hướng dẫn 11 bài sa hình ô tô và 4 bài thi xe máy với sơ đồ động, mẹo và lỗi trừ điểm.",
  path: "/lo-trinh/",
});

export default function RoadmapPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <JourneyPage />
      </main>
      <Footer />
    </>
  );
}
