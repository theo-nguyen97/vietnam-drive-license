"use client";

import { useHydrated, useProgress } from "@/store/progress";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { LicenseHub } from "@/components/hub/LicenseHub";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";

/** Trang chủ: lần đầu → màn chào 2 bước; sau đó → trang học của hạng đã chọn. */
export function HomeGate() {
  const hydrated = useHydrated();
  const license = useProgress((s) => s.lastLicense);
  const onboarded = useProgress((s) => s.onboarded);

  if (!hydrated) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <div className="flex gap-2">
          <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
          <span className="h-3 w-3 animate-pulse rounded-full bg-amber-400 [animation-delay:.2s]" />
          <span className="h-3 w-3 animate-pulse rounded-full bg-green-500 [animation-delay:.4s]" />
        </div>
      </main>
    );
  }

  if (!license || (!onboarded && !license)) {
    return (
      <main className="flex flex-1 flex-col">
        <Onboarding />
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
