import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LICENSES, getLicense } from "@/data/licenses";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { ExamSetBoard } from "@/components/hub/ExamSetBoard";
import { setCount } from "@/lib/exam";
import { pageMeta } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return LICENSES.map((l) => ({ id: l.id.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps<"/hang/[id]/bo-de">): Promise<Metadata> {
  const { id } = await params;
  const lic = getLicense(id);
  if (!lic) return { title: "Bộ đề thi thử" };
  return pageMeta({
    title: `Bộ ${setCount(lic.id)} đề thi thử lý thuyết hạng ${lic.id}`,
    description: `${setCount(lic.id)} đề thi thử lý thuyết bằng lái ${lic.name} theo cấu trúc Thông tư 12/2025 (${lic.exam.total} câu, ${lic.exam.minutes} phút) và đề mới từ 01/3/2027 (${lic.exam2027.total} câu). Lưu kết quả từng đề, xem lại câu sai.`,
    path: `/hang/${lic.id.toLowerCase()}/bo-de/`,
  });
}

export default async function SetsPage({ params }: PageProps<"/hang/[id]/bo-de">) {
  const { id } = await params;
  const lic = getLicense(id);
  if (!lic) notFound();
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <ExamSetBoard license={lic.id} />
      </main>
      <Footer />
    </>
  );
}
