import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LICENSES, getLicense } from "@/data/licenses";
import { pageMeta } from "@/lib/site";
import { setKeysFor, setMeta } from "@/lib/sets";
import { PracticeRunner } from "@/components/quiz/PracticeRunner";

export const dynamicParams = false;

export function generateStaticParams() {
  return LICENSES.flatMap((l) => setKeysFor(l.id).map((set) => ({ id: l.id.toLowerCase(), set })));
}

export async function generateMetadata({ params }: PageProps<"/hang/[id]/on-tap/[set]">): Promise<Metadata> {
  const { id, set } = await params;
  const lic = getLicense(id);
  return pageMeta({
    title: `${setMeta(set).title} · Hạng ${lic?.id ?? ""}`,
    description: `Ôn tập ${setMeta(set).title.toLowerCase()} lý thuyết bằng lái hạng ${lic?.id ?? ""}: phản hồi ngay, giải thích chi tiết, mẹo nhớ và sa hình động.`,
    path: `/hang/${id}/on-tap/${set}/`,
    noindex: true,
  });
}

export default async function PracticePage({ params }: PageProps<"/hang/[id]/on-tap/[set]">) {
  const { id, set } = await params;
  const lic = getLicense(id);
  if (!lic || !setKeysFor(lic.id).includes(set)) notFound();
  return (
    <main className="flex flex-1 flex-col">
      <PracticeRunner license={lic.id} set={set} />
    </main>
  );
}
