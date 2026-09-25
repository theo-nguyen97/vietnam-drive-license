"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import clsx from "clsx";
import { COURSE, STEPS, type JourneyGroup } from "@/data/journey";
import { getLicense } from "@/data/licenses";
import { useHydrated, useProgress } from "@/store/progress";
import { CourseDiagram } from "./CourseDiagram";

export function JourneyPage() {
  const hydrated = useHydrated();
  const last = useProgress((s) => s.lastLicense);
  const journey = useProgress((s) => s.journey);
  const toggle = useProgress((s) => s.toggleJourney);
  const [picked, setPicked] = useState<JourneyGroup | null>(null);
  const group: JourneyGroup = picked ?? (hydrated && last && getLicense(last)?.group === "moto" ? "moto" : "car");
  const steps = STEPS[group];
  const done = hydrated ? steps.filter((s) => journey[s.key]).length : 0;
  const course = COURSE[group];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
      <p className="font-hud text-sm uppercase tracking-[0.2em] text-lane">Lộ trình lấy bằng</p>
      <h1 className="font-display text-3xl text-white sm:text-4xl">Từ đăng ký đến cầm bằng</h1>
      <p className="mt-2 max-w-2xl text-white/65">
        Các bước theo quy định mới nhất (Thông tư 108/2026/TT-BCA), kèm hướng dẫn thi sa hình thực hành có hình động. Đánh dấu từng bước khi bạn hoàn thành.
      </p>

      <div role="tablist" className="mt-5 inline-grid grid-cols-2 gap-1 rounded-2xl bg-black/30 p-1 ring-1 ring-white/10">
        {(
          [
            ["car", "🚗 Ô tô (hạng B)"],
            ["moto", "🛵 Xe máy (A1, A)"],
          ] as const
        ).map(([g, label]) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={group === g}
            onClick={() => setPicked(g)}
            className={clsx(
              "rounded-xl px-4 py-2 text-sm font-extrabold transition",
              group === g ? "bg-[linear-gradient(180deg,#ffe57a,#f5b700)] text-slate-950 shadow-[0_2px_0_#a87800]" : "text-white/70 hover:bg-white/5",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Các bước */}
      <section className="mt-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-lane to-green-500 transition-all" style={{ width: `${(done / steps.length) * 100}%` }} />
          </div>
          <span className="font-hud text-sm text-white/70">
            {done}/{steps.length} bước
          </span>
        </div>
        <ol className="relative flex flex-col gap-3 before:absolute before:bottom-6 before:left-[21px] before:top-6 before:w-1 before:rounded-full before:bg-white/10">
          {steps.map((s, i) => {
            const ok = hydrated && journey[s.key];
            return (
              <motion.li key={s.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="relative flex gap-3">
                <button
                  type="button"
                  onClick={() => toggle(s.key)}
                  aria-pressed={!!ok}
                  aria-label={`${ok ? "Bỏ đánh dấu" : "Đánh dấu hoàn thành"}: ${s.title}`}
                  className={clsx(
                    "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 text-lg transition",
                    ok ? "border-green-400 bg-green-500 text-white shadow-[0_0_16px_#22c55e88]" : "border-asphalt-700 bg-asphalt-800 hover:border-lane/60",
                  )}
                >
                  {ok ? <Check className="h-5 w-5" /> : s.icon}
                </button>
                <div className={clsx("min-w-0 flex-1 rounded-2xl p-4 ring-1", ok ? "bg-green-500/5 ring-green-500/20" : "bg-asphalt-850 ring-white/10")}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-hud text-xs text-white/40">Bước {i + 1}</span>
                    <h2 className="font-bold text-white">{s.title}</h2>
                    {s.isNew && <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[0.625rem] font-bold text-indigo-200 ring-1 ring-indigo-400/30">{s.isNew}</span>}
                  </div>
                  <p className="mt-0.5 text-sm text-white/60">{s.desc}</p>
                  <ul className="mt-2 space-y-1 text-sm text-white/80">
                    {s.items.map((it) => (
                      <li key={it} className="flex gap-2">
                        <span className="text-lane">•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                  {s.link && (
                    <Link href={s.link.href} className="mt-2 inline-block text-sm font-bold text-lane hover:underline">
                      {s.link.label} →
                    </Link>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ol>
      </section>

      {/* Sa hình thực hành */}
      <section className="mt-12">
        <p className="font-hud text-sm uppercase tracking-[0.2em] text-lane">Thực hành trong hình</p>
        <h2 className="font-display text-2xl text-white sm:text-3xl">{group === "car" ? "11 bài sa hình ô tô" : "4 phần thi sa hình xe máy"}</h2>
        <p className="mt-1 text-sm text-white/60">
          {group === "car"
            ? "Thang điểm 100, đạt từ 80 điểm. Tốc độ trong hình không quá 24 km/h (hạng B), không để xe chết máy (mỗi lần −5 điểm)."
            : "Thang điểm 100, đạt từ 80 điểm. Đi đúng thứ tự, không chạm vạch, không chống chân."}
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {course.map((ex) => (
            <article key={ex.id} className="overflow-hidden rounded-3xl bg-asphalt-850 ring-1 ring-white/10">
              <div className="relative aspect-[16/9] bg-slate-900">
                <CourseDiagram key={`${group}-${ex.id}`} kind={ex.diagram} />
                <span className="absolute left-3 top-3 rounded-lg bg-slate-950/85 px-2 py-1 font-hud text-xs text-lane ring-1 ring-white/10">
                  {ex.id === "nguy-hiem" ? "BẤT NGỜ" : `BÀI ${ex.no}`}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-white">{ex.title}</h3>
                <p className="mt-1 text-sm text-white/75">🎯 {ex.goal}</p>
                <ul className="mt-2 space-y-1 text-sm text-white/65">
                  {ex.tips.map((t) => (
                    <li key={t}>💡 {t}</li>
                  ))}
                </ul>
                <div className="mt-3 rounded-2xl bg-red-500/5 p-3 ring-1 ring-red-500/20">
                  <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-red-300">Lỗi hay bị trừ điểm</div>
                  <ul className="space-y-1">
                    {ex.faults.map((f) => (
                      <li key={f.text} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-white/75">{f.text}</span>
                        <span className={clsx("shrink-0 font-hud text-xs", f.pts === "Truất quyền" ? "text-red-400" : "text-amber-300")}>{f.pts}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs text-white/40">
          Mức trừ điểm là mức phổ biến theo hướng dẫn của các trung tâm sát hạch, chỉ mang tính tham khảo — hãy làm theo hướng dẫn của trung tâm nơi bạn dự thi.
        </p>
      </section>
    </div>
  );
}
