import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LICENSES, getLicense } from "@/data/licenses";
import { ExamRunner } from "@/components/quiz/ExamRunner";

export const dynamicParams = false;

export function generateStaticParams() {
  return LICENSES.map((l) => ({ id: l.id.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps<"/hang/[id]/thi-thu">): Promise<Metadata> {
  const { id } = await params;
  const lic = getLicense(id);
  return { title: `Thi thử hạng ${lic?.id ?? ""}` };
}

export default async function ExamPage({ params }: PageProps<"/hang/[id]/thi-thu">) {
  const { id } = await params;
  const lic = getLicense(id);
  if (!lic) notFound();
  return (
    <main className="flex flex-1 flex-col">
      <ExamRunner license={lic.id} />
    </main>
  );
}
