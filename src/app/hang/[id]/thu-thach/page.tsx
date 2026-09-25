import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LICENSES, getLicense } from "@/data/licenses";
import { ArcadeRunner } from "@/components/games/ArcadeRunner";

export const dynamicParams = false;

export function generateStaticParams() {
  return LICENSES.map((l) => ({ id: l.id.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps<"/hang/[id]/thu-thach">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Thử thách 12 điểm · hạng ${getLicense(id)?.id ?? ""}` };
}

export default async function ArcadePage({ params }: PageProps<"/hang/[id]/thu-thach">) {
  const { id } = await params;
  const lic = getLicense(id);
  if (!lic) notFound();
  return (
    <main className="flex flex-1 flex-col">
      <ArcadeRunner license={lic.id} />
    </main>
  );
}
