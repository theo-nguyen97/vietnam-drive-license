import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { Exam2027Panel } from "@/components/news/Exam2027Panel";
import { NEWS, SORTED_NEWS, getNews, type NewsBlock } from "@/data/news";

export const dynamicParams = false;

export function generateStaticParams() {
  return NEWS.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tin-tuc/[slug]">): Promise<Metadata> {
  const n = getNews((await params).slug);
  return n ? { title: n.title, description: n.summary } : {};
}

export default async function ArticlePage({ params }: PageProps<"/tin-tuc/[slug]">) {
  const n = getNews((await params).slug);
  if (!n) notFound();
  const more = SORTED_NEWS.filter((x) => x.slug !== n.slug).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link href="/tin-tuc" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/55 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Tin tức
        </Link>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-semibold text-white/70">{n.category}</span>
          <span className="text-white/40">Cập nhật {n.date}</span>
        </div>
        <h1 className="mt-2 font-display text-2xl leading-tight text-white sm:text-3xl">
          <span className="mr-2">{n.emoji}</span>
          {n.title}
        </h1>
        <p className="mt-3 text-lg text-white/70">{n.summary}</p>

        <article className="mt-6 flex flex-col gap-4 text-white/80">
          {n.body.map((b, i) => (
            <Block key={i} b={b} />
          ))}
        </article>

        <p className="mt-8 border-t border-white/10 pt-4 text-xs text-white/45">
          Nguồn: {n.sources.join(" · ")}. Nội dung tóm tắt để ôn luyện — hãy đối chiếu văn bản gốc khi cần.
        </p>

        <h2 className="mb-3 mt-10 font-bold text-white">Đọc thêm</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {more.map((m) => (
            <Link key={m.slug} href={`/tin-tuc/${m.slug}`} className="group rounded-2xl bg-asphalt-850 p-4 ring-1 ring-white/10 hover:ring-white/25">
              <div className="text-2xl">{m.emoji}</div>
              <div className="mt-2 text-sm font-bold leading-snug text-white group-hover:text-lane">{m.title}</div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Block({ b }: { b: NewsBlock }) {
  switch (b.type) {
    case "p":
      return <p className="leading-relaxed">{b.text}</p>;
    case "h":
      return <h2 className="mt-4 text-lg font-bold text-white">{b.text}</h2>;
    case "list":
      return (
        <ul className="flex flex-col gap-2">
          {b.items.map((t) => (
            <li key={t} className="flex gap-2.5 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lane" />
              {t}
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-2xl ring-1 ring-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-white/50">
              <tr>
                {b.head.map((h) => (
                  <th key={h} className="px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r) => (
                <tr key={r[0]} className="border-t border-white/5">
                  {r.map((c, j) => (
                    <td key={j} className={j === 0 ? "px-3 py-2 font-semibold text-white" : "px-3 py-2"}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "timeline":
      return (
        <ol className="relative ml-2 flex flex-col gap-4 border-l-2 border-dashed border-white/15 pl-5">
          {b.items.map((t) => (
            <li key={t.date} className="relative">
              <span className="absolute -left-[1.72rem] top-1 h-3 w-3 rounded-full bg-lane ring-4 ring-asphalt-950" />
              <div className="font-hud text-sm font-bold text-lane">{t.date}</div>
              <div className="leading-relaxed">{t.text}</div>
            </li>
          ))}
        </ol>
      );
    case "tip":
      return (
        <div className="flex gap-3 rounded-2xl bg-emerald-500/10 p-4 text-emerald-100 ring-1 ring-emerald-400/25">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
          <p className="leading-relaxed">{b.text}</p>
        </div>
      );
    case "exam2027":
      return <Exam2027Panel />;
  }
}
