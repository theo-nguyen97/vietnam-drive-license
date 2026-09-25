import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LICENSES, getLicense } from "@/data/licenses";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { LicenseHub } from "@/components/hub/LicenseHub";

export const dynamicParams = false;

export function generateStaticParams() {
  return LICENSES.map((l) => ({ id: l.id.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps<"/hang/[id]">): Promise<Metadata> {
  const { id } = await params;
  const lic = getLicense(id);
  return { title: lic ? `Ôn thi GPLX ${lic.name}` : "Hạng bằng" };
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
