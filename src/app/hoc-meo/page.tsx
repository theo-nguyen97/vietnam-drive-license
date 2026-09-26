import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { TipsPage } from "@/components/tips/TipsPage";
import { TIPS, TIP_GROUPS } from "@/data/tips";
import { QUESTIONS } from "@/data/questions";

export const metadata: Metadata = pageMeta({
  title: "Học mẹo thi lý thuyết lái xe",
  description:
    "Mẹo thi lý thuyết bằng lái xe: nhận diện câu điểm liệt, câu thần chú sa hình 'nhất chớm – nhì ưu – tam đường – tứ hướng', con số tốc độ – khoảng cách – độ tuổi, cặp biển báo dễ nhầm và mẹo nhớ cho từng câu trong bộ 600 câu.",
  path: "/hoc-meo/",
});

export default function TipsRoute() {
  const tipCount = QUESTIONS.filter((q) => q.tip).length;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <p className="font-hud text-sm font-bold uppercase tracking-[0.2em] text-lane">Học nhanh · nhớ lâu</p>
        <h1 className="font-display text-3xl text-white">Học mẹo</h1>
        <p className="mb-6 mt-1 max-w-3xl text-white/60">
          {TIPS.length} mẹo biên soạn theo {TIP_GROUPS.length} nhóm (cách làm bài, câu điểm liệt, con số, biển báo, sa hình, kỹ thuật…) và {tipCount} mẹo nhớ gắn với
          từng câu hỏi. Mẹo giúp nhớ nhanh, nhưng hãy luôn hiểu quy tắc phía sau — mỗi mẹo đều có phần giải thích và nút luyện tập chủ đề tương ứng.
        </p>
        <TipsPage />
      </main>
      <Footer />
    </>
  );
}
