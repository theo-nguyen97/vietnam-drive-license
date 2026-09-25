import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Onboarding } from "@/components/onboarding/Onboarding";

export const metadata: Metadata = pageMeta({
  title: "Chọn hạng bằng",
  description: "Chọn hạng giấy phép lái xe bạn sắp thi (A1, A, B1, B, C1, C, D…) và thời điểm thi để Lái Lụa chọn đúng cấu trúc đề.",
  path: "/chon-hang/",
  noindex: true,
});

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
