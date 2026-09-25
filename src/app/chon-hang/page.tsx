import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Onboarding } from "@/components/onboarding/Onboarding";

export const metadata: Metadata = { title: "Chọn hạng bằng" };

export default function ChooseLicensePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Onboarding mode="change" />
      </main>
    </>
  );
}
