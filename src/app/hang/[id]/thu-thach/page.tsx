import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LICENSES, getLicense } from "@/data/licenses";
import { pageMeta } from "@/lib/site";
import { ArcadeRunner } from "@/components/games/ArcadeRunner";

export const dynamicParams = false;

export function generateStaticParams() {
  return LICENSES.map((l) => ({ id: l.id.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps<"/hang/[id]/thu-thach">): Promise<Metadata> {
  const { id } = await params;
  const lic = getLicense(id);
  return pageMeta({
    title: `Thử thách 12 điểm · hạng ${lic?.id ?? ""}`,
    description: `Chế độ sinh tồn: trả lời câu hỏi lý thuyết hạng ${lic?.id ?? ""}, sai bị trừ điểm GPLX như luật mới, hết 12 điểm là "tước bằng".`,
    path: `/hang/${id}/thu-thach/`,
    noindex: true,
  });
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
