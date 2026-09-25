import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LICENSES, getLicense } from "@/data/licenses";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { WeaknessReport } from "@/components/hub/WeaknessReport";

export const dynamicParams = false;

export function generateStaticParams() {
  return LICENSES.map((l) => ({ id: l.id.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps<"/hang/[id]/diem-yeu">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Chẩn đoán điểm yếu · hạng ${getLicense(id)?.id ?? ""}` };
}

export default async function WeaknessPage({ params }: PageProps<"/hang/[id]/diem-yeu">) {
  const { id } = await params;
  const lic = getLicense(id);
  if (!lic) notFound();
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <WeaknessReport license={lic.id} />
      </main>
      <Footer />
    </>
  );
}
