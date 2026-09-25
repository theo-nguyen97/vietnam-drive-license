import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LICENSES, getLicense } from "@/data/licenses";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { ExamSetBoard } from "@/components/hub/ExamSetBoard";

export const dynamicParams = false;

export function generateStaticParams() {
  return LICENSES.map((l) => ({ id: l.id.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps<"/hang/[id]/bo-de">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Bộ đề 2026 hạng ${getLicense(id)?.id ?? ""}` };
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
