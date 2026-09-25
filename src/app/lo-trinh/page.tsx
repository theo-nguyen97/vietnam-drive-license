import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { JourneyPage } from "@/components/journey/JourneyPage";

export const metadata: Metadata = { title: "Lộ trình lấy bằng & sa hình thực hành" };

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
