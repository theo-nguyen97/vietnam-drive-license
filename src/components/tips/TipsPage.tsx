"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Lightbulb, Search, Dumbbell, Play } from "lucide-react";
import clsx from "clsx";
import { TIPS, TIP_GROUPS, type TipGroupId } from "@/data/tips";
import { QUESTIONS } from "@/data/questions";
import { CHAPTERS } from "@/data/chapters";
import { getTopic } from "@/lib/topics";
import { fold } from "@/lib/whatif";
import { TrafficSign } from "@/components/signs/TrafficSign";
import { useHydrated, useProgress } from "@/store/progress";

/** Trang Học mẹo: mẹo biên soạn theo nhóm + toàn bộ mẹo nhớ gắn với từng câu hỏi trong ngân hàng. */
export function TipsPage() {
  const hydrated = useHydrated();
  const last = useProgress((s) => s.lastLicense);
  const base = hydrated && last ? `/hang/${last.toLowerCase()}` : null;
  const [group, setGroup] = useState<TipGroupId | "all">("all");
  const [query, setQuery] = useState("");

  const groups = group === "all" ? TIP_GROUPS : TIP_GROUPS.filter((g) => g.id === group);
  const q = fold(query.trim());

  const perQuestion = useMemo(() => {
    const list = QUESTIONS.filter((x) => x.tip);
    const filtered = q ? list.filter((x) => fold(`${x.tip} ${x.text}`).includes(q)) : list;
    return CHAPTERS.map((c) => ({ chapter: c, items: filtered.filter((x) => x.chapter === c.id) })).filter((g) => g.items.length);
  }, [q]);
  const totalTips = QUESTIONS.filter((x) => x.tip).length;

  const curated = q ? TIPS.filter((t) => fold(`${t.title} ${t.mnemonic} ${t.body}`).includes(q)) : TIPS;

  return (
    <div className="flex flex-col gap-8">
      {/* Bộ lọc */}
      <div className="flex flex-col gap-3 rounded-3xl bg-asphalt-850 p-4 ring-1 ring-white/10">
        <label className="flex w-full items-center gap-2 rounded-2xl bg-black/30 px-3 py-2 ring-1 ring-white/10 focus-within:ring-lane/60 sm:max-w-md">
          <Search className="h-4 w-4 text-white/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm mẹo: vòng xuyến, tốc độ, cấm đỗ…"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            aria-label="Tìm mẹo"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={group === "all"} onClick={() => setGroup("all")}>
            Tất cả
          </Chip>
          {TIP_GROUPS.map((g) => (
            <Chip key={g.id} active={group === g.id} onClick={() => setGroup(g.id)}>
              {g.icon} {g.name}
            </Chip>
          ))}
        </div>
      </div>

      {/* Mẹo theo nhóm */}
      {groups.map((g) => {
        const tips = curated.filter((t) => t.group === g.id);
        if (!tips.length) return null;
        return (
          <section key={g.id} id={g.id} className="scroll-mt-20">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-white">
                  {g.icon} {g.name}
                </h2>
                <p className="mt-0.5 text-sm text-white/60">{g.desc}</p>
              </div>
              {g.topics && g.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {g.topics.slice(0, 3).map((tid) => {
                    const t = getTopic(tid);
                    if (!t) return null;
                    return (
                      <Link
                        key={tid}
                        href={base ? `${base}/on-tap/chu-de-${tid}` : "/chon-hang"}
                        className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-lane/15 hover:text-lane"
                      >
                        <Dumbbell className="h-3.5 w-3.5" /> Luyện: {t.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {tips.map((t) => (
                <article key={t.id} id={t.id} className="flex flex-col gap-3 rounded-3xl bg-asphalt-850 p-5 ring-1 ring-white/10">
                  <h3 className="font-bold text-white">{t.title}</h3>
                  <p className="flex gap-2 rounded-2xl bg-amber-400/10 p-3 text-[0.95rem] font-semibold leading-snug text-amber-200 ring-1 ring-amber-400/25">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{t.mnemonic}</span>
                  </p>
                  {t.signs && (
                    <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-3">
                      {t.signs.map((code) => (
                        <figure key={code} className="flex flex-col items-center gap-1">
                          <TrafficSign code={code} size={56} />
                          <figcaption className="text-[0.625rem] font-bold text-slate-500">{code}</figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed text-white/75">{t.body}</p>
                  {t.questions && t.questions.length > 0 && (
                    <p className="text-xs text-white/45">
                      Câu minh hoạ: {t.questions.map((id) => `#${id}`).join(", ")}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {/* Mẹo theo từng câu */}
      <section id="theo-cau" className="scroll-mt-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-white">💡 Mẹo nhớ theo từng câu</h2>
            <p className="mt-0.5 text-sm text-white/60">
              {totalTips} câu trong ngân hàng có mẹo nhớ riêng. Bấm vào chương để xem; luyện ngay bằng bài “Học theo mẹo”.
            </p>
          </div>
          <Link
            href={base ? `${base}/on-tap/co-meo` : "/chon-hang"}
            className="flex items-center gap-2 rounded-2xl bg-[linear-gradient(180deg,#ffe57a,#f5b700)] px-4 py-2 font-bold text-slate-950 shadow-[0_4px_0_#a87800] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Play className="h-4 w-4" /> Luyện các câu có mẹo
          </Link>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {perQuestion.map(({ chapter, items }) => (
            <details key={chapter.id} open={!!q || chapter.id === 1} className="group rounded-3xl bg-asphalt-850 ring-1 ring-white/10">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4 font-bold text-white">
                <span className="text-xl">{chapter.icon}</span>
                <span className="flex-1">{chapter.short}</span>
                <span className="rounded-lg bg-white/10 px-2 py-0.5 font-hud text-xs">{items.length} mẹo</span>
                <span className="text-white/40 transition group-open:rotate-90">›</span>
              </summary>
              <ul className="grid gap-2 px-4 pb-4 md:grid-cols-2">
                {items.map((x) => (
                  <li key={x.id} className="rounded-2xl bg-black/25 p-3 ring-1 ring-white/5">
                    <p className="text-xs text-white/50">
                      #{x.id} · {x.text}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-amber-200">💡 {x.tip}</p>
                  </li>
                ))}
              </ul>
            </details>
          ))}
          {perQuestion.length === 0 && <p className="rounded-3xl bg-asphalt-850 p-6 text-center text-white/50 ring-1 ring-white/10">Không có mẹo nào khớp “{query}”.</p>}
        </div>
      </section>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-xl px-3 py-1.5 text-xs font-semibold ring-1 transition",
        active ? "bg-lane text-slate-950 ring-lane" : "bg-white/5 text-white/75 ring-white/10 hover:bg-white/10",
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
