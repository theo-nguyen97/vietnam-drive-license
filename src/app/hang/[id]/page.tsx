import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LICENSES, getLicense } from "@/data/licenses";
import { setCount } from "@/lib/exam";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { LicenseHub } from "@/components/hub/LicenseHub";
import { pageMeta } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return LICENSES.map((l) => ({ id: l.id.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps<"/hang/[id]">): Promise<Metadata> {
  const { id } = await params;
  const lic = getLicense(id);
  if (!lic) return { title: "Hạng bằng" };
  return pageMeta({
    title: `Ôn thi lý thuyết GPLX ${lic.name} — ${lic.short}`,
    description: `Ôn tập và thi thử lý thuyết bằng lái ${lic.name} (${lic.short}): đề ${lic.exam.total} câu / ${lic.exam.minutes} phút, đạt ${lic.exam.pass}/${lic.exam.total}, ${setCount(lic.id)} bộ đề, câu điểm liệt, ôn theo chương, sa hình động và chẩn đoán điểm yếu.`,
    path: `/hang/${lic.id.toLowerCase()}/`,
  });
}

export default async function LicensePage({ params }: PageProps<"/hang/[id]">) {
  const { id } = await params;
  const lic = getLicense(id);
  if (!lic) notFound();
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <LicenseHub license={lic.id} />
      </main>
      <Footer />
    </>
  );
}
