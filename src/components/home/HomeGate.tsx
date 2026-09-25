"use client";

import { useHydrated, useProgress } from "@/store/progress";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { LicenseHub } from "@/components/hub/LicenseHub";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { HomeLanding } from "./HomeLanding";

/** Trang chủ: lần đầu → màn chào 2 bước; sau đó → trang học của hạng đã chọn. */
export function HomeGate() {
  const hydrated = useHydrated();
  const license = useProgress((s) => s.lastLicense);

  // Trước khi nạp tiến độ: hiển thị phần giới thiệu tĩnh (có sẵn trong HTML cho SEO).
  // Người đã chọn hạng được đánh dấu `data-returning` từ <head> nên khối này bị ẩn — tránh chớp nội dung.
  if (!hydrated) {
    return (
      <main className="relative flex flex-1 flex-col" aria-busy>
        <HomeLanding />
        <div className="home-loader absolute inset-0 hidden items-center justify-center" aria-hidden>
          <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
          <span className="ml-2 h-3 w-3 animate-pulse rounded-full bg-amber-400 [animation-delay:.2s]" />
          <span className="ml-2 h-3 w-3 animate-pulse rounded-full bg-green-500 [animation-delay:.4s]" />
        </div>
      </main>
    );
  }

  if (!license) {
    return (
      <main className="flex flex-1 flex-col">
        <Onboarding />
        <HomeLanding headingLevel={2} />
      </main>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <LicenseHub license={license} home />
      </main>
      <Footer />
    </>
  );
}
