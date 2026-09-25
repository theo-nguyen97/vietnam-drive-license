import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";
import { SettingsPanel } from "@/components/progress/SettingsPanel";

export const metadata: Metadata = { title: "Tôi — tiến độ & cài đặt" };

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
