import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { SignLibrary } from "@/components/signs/SignLibrary";

export const metadata: Metadata = { title: "Thư viện biển báo" };

export default function SignsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <p className="font-hud text-sm font-bold uppercase tracking-[0.2em] text-lane">QCVN 41</p>
        <h1 className="font-display text-3xl text-white">Thư viện biển báo</h1>
        <p className="mb-4 mt-1 text-white/60">Các biển báo thường gặp trong đề thi, kèm ý nghĩa ngắn gọn.</p>
        <SignLibrary />
      </main>
      <Footer />
    </>
  );
}
