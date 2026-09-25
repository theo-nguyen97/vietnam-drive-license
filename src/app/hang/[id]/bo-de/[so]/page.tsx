import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LICENSES, getLicense } from "@/data/licenses";
import { setCount } from "@/lib/exam";
import { ExamRunner } from "@/components/quiz/ExamRunner";

export const dynamicParams = false;

export function generateStaticParams() {
  return LICENSES.flatMap((l) => Array.from({ length: setCount(l.id) }, (_, i) => ({ id: l.id.toLowerCase(), so: String(i + 1) })));
}

export async function generateMetadata({ params }: PageProps<"/hang/[id]/bo-de/[so]">): Promise<Metadata> {
  const { id, so } = await params;
  return { title: `Đề số ${so} · hạng ${getLicense(id)?.id ?? ""}` };
}

export default async function SetExamPage({ params }: PageProps<"/hang/[id]/bo-de/[so]">) {
  const { id, so } = await params;
  const lic = getLicense(id);
  const n = Number(so);
  if (!lic || !Number.isInteger(n) || n < 1 || n > setCount(lic.id)) notFound();
  return (
    <main className="flex flex-1 flex-col">
      <ExamRunner key={n} license={lic.id} setNo={n} />
    </main>
  );
}
