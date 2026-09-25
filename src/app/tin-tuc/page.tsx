import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { NewsList } from "@/components/news/NewsList";
import { OFFICIAL_LINKS } from "@/data/news";

export const metadata: Metadata = { title: "Tin tức luật giao thông" };

export default function NewsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <p className="font-hud text-sm font-bold uppercase tracking-[0.2em] text-lane">Cập nhật</p>
        <h1 className="font-display text-3xl text-white">Tin tức luật giao thông</h1>
        <p className="mb-6 mt-1 text-white/60">Những thay đổi về đề thi, luật và mức phạt — tóm tắt ngắn gọn cho người đang học lái.</p>
        <NewsList />
        <section className="mt-10 rounded-3xl bg-white/[0.03] p-5 ring-1 ring-white/10">
          <h2 className="font-bold text-white">Tra cứu văn bản chính thức</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {OFFICIAL_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-lane">
                  <ExternalLink className="h-4 w-4 shrink-0" /> {l.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
