import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";
import { SettingsPanel } from "@/components/progress/SettingsPanel";

export const metadata: Metadata = pageMeta({
  title: "Tôi — tiến độ & cài đặt",
  description: "Tiến độ học, lịch sử thi thử, bằng lái ảo và cài đặt: hạng bằng, cấu trúc đề, cỡ chữ, âm thanh, học offline.",
  path: "/tien-do/",
  noindex: true,
});

export default function ProgressPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <h1 className="mb-6 font-display text-3xl text-white">Tôi</h1>
        <div className="flex flex-col gap-6">
          <SettingsPanel />
          <ProgressDashboard />
        </div>
      </main>
      <Footer />
    </>
  );
}
