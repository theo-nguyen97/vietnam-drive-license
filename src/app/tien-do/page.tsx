import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";

export const metadata: Metadata = { title: "Tiến độ học" };

export default function ProgressPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <h1 className="mb-6 font-display text-3xl text-white">Tiến độ học</h1>
        <ProgressDashboard />
      </main>
      <Footer />
    </>
  );
}
