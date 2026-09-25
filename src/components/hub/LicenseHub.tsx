"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Trophy, Shuffle, AlertTriangle, RotateCcw, Bookmark, ListOrdered, ChevronRight } from "lucide-react";
import clsx from "clsx";
import type { LicenseId } from "@/lib/types";
import { getLicense } from "@/data/licenses";
import { CHAPTERS } from "@/data/chapters";
import { useHydrated, useProgress } from "@/store/progress";
import { licenseProgress } from "@/lib/stats";
import { questionsFor } from "@/data/questions";
import { VehicleIcon } from "@/components/ui/VehicleIcon";
import { Gauge } from "./Gauge";

export function LicenseHub({ license }: { license: LicenseId }) {
  const lic = getLicense(license)!;
  const hydrated = useHydrated();
  const stats = useProgress((s) => s.stats);
  const exams = useProgress((s) => s.exams);
  const bookmarks = useProgress((s) => s.bookmarks);
  const p = licenseProgress(license, hydrated ? stats : {}, hydrated ? exams : []);
  const chapters = CHAPTERS.filter((c) => c.groups.includes(lic.group));
  const base = `/hang/${license.toLowerCase()}`;
  const allIds = new Set(questionsFor(license).map((q) => q.id));
  const saved = hydrated ? bookmarks.filter((b) => allIds.has(b)).length : 0;
  const current = chapters.findIndex((c) => {
    const ch = p.chapters[c.id];
    return !ch || ch.mastered / ch.total < 0.8;
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* Thẻ hạng bằng */}
      <section className="relative overflow-hidden rounded-3xl bg-asphalt-850 ring-1 ring-white/10">
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 85% 20%, ${lic.color}, transparent 55%)` }} />
        <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-14 min-w-14 items-center justify-center rounded-2xl px-3 font-display text-3xl text-slate-900" style={{ background: lic.color }}>
                {lic.id}
              </span>
              <div>
                <h1 className="font-display text-2xl text-white sm:text-3xl">GPLX {lic.name}</h1>
                <p className="text-sm font-semibold text-white/60">{lic.short}</p>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-white/75">{lic.desc}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <Pill>Tuổi tối thiểu: {lic.minAge}</Pill>
              <Pill>Thời hạn: {lic.validity}</Pill>
              <Pill>
                Đề thi: {lic.exam.total} câu / {lic.exam.minutes} phút
              </Pill>
              <Pill>
                Đạt: {lic.exam.pass}/{lic.exam.total}
              </Pill>
            </div>
          </div>
          <div className="flex justify-center">
            <Gauge value={p.pct} color={lic.color} label="Mức sẵn sàng" />
          </div>
          <div className="hidden w-44 md:block">
            <VehicleIcon kind={lic.vehicle} className="bob w-full drop-shadow-2xl" />
          </div>
        </div>
        <div className="relative grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">
          <Metric k="Đã làm" v={`${p.seen}/${p.total}`} />
          <Metric k="Điểm liệt đã thuộc" v={`${p.criticalMastered}/${p.critical}`} />
          <Metric k="Lần thi thử" v={`${p.passed}/${p.exams} đạt`} />
          <Metric k="Điểm cao nhất" v={p.exams ? `${Math.round(p.best * 100)}%` : "–"} />
        </div>
      </section>

      {/* Hành động nhanh */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href={`${base}/thi-thu`}
          className="group relative flex items-center gap-4 overflow-hidden rounded-3xl bg-lane p-5 text-slate-900 shadow-[0_10px_40px_rgba(255,210,63,.25)] transition hover:brightness-110 sm:col-span-2"
        >
          <div className="hazard-stripes absolute inset-y-0 right-0 w-10 opacity-60" />
          <Trophy className="h-10 w-10 shrink-0" />
          <div>
            <div className="font-display text-2xl">THI THỬ</div>
            <div className="text-sm font-semibold opacity-80">
              Đề ngẫu nhiên {lic.exam.total} câu · {lic.exam.minutes} phút · có câu điểm liệt
            </div>
          </div>
          <ChevronRight className="ml-auto mr-8 h-6 w-6 transition group-hover:translate-x-1" />
        </Link>
        <QuickSet href={`${base}/on-tap/diem-liet`} icon={<AlertTriangle className="h-5 w-5" />} title="Câu điểm liệt" desc={`${p.critical} câu — sai là trượt`} tone="text-red-300 bg-red-500/10 ring-red-400/25" />
        <QuickSet href={`${base}/on-tap/ngau-nhien`} icon={<Shuffle className="h-5 w-5" />} title="Chạy ngẫu nhiên" desc="20 câu bất kỳ" tone="text-sky-300 bg-sky-500/10 ring-sky-400/25" />
        <QuickSet href={`${base}/on-tap/cau-sai`} icon={<RotateCcw className="h-5 w-5" />} title="Câu hay sai" desc={hydrated ? `${p.wrong} câu cần ôn lại` : "Ôn lại câu sai"} tone="text-orange-300 bg-orange-500/10 ring-orange-400/25" />
        <QuickSet href={`${base}/on-tap/da-luu`} icon={<Bookmark className="h-5 w-5" />} title="Câu đã lưu" desc={`${saved} câu`} tone="text-violet-300 bg-violet-500/10 ring-violet-400/25" />
        <QuickSet href={`${base}/on-tap/tat-ca`} icon={<ListOrdered className="h-5 w-5" />} title="Toàn bộ câu hỏi" desc={`${p.total} câu theo thứ tự`} tone="text-emerald-300 bg-emerald-500/10 ring-emerald-400/25" />
      </section>

      {/* Bản đồ hành trình */}
      <section className="mt-12">
        <p className="font-hud text-sm font-bold uppercase tracking-[0.2em] text-lane">Bản đồ hành trình</p>
        <h2 className="font-display text-2xl text-white sm:text-3xl">Ôn tập theo chặng</h2>
        <p className="mt-1 text-white/60">Hoàn thành ≥ 80% mỗi chặng để mở đèn xanh. Bạn có thể chạy chặng bất kỳ.</p>

        <div className="relative mt-8">
          {/* con đường */}
          <div className="absolute bottom-0 left-[26px] top-0 w-[44px] -translate-x-1/2 rounded-full bg-asphalt-700 ring-1 ring-white/10 md:left-1/2">
            <div className="mx-auto h-full w-[3px] bg-[linear-gradient(var(--color-lane)_0_50%,transparent_50%_100%)] bg-[length:3px_28px] opacity-70" />
          </div>
          <ol className="relative flex flex-col gap-6">
            {chapters.map((c, i) => {
              const ch = p.chapters[c.id] ?? { total: 0, mastered: 0, seen: 0 };
              const pct = ch.total ? ch.mastered / ch.total : 0;
              const state = pct >= 0.8 ? "done" : ch.seen > 0 ? "doing" : "todo";
              const right = i % 2 === 1;
              return (
                <motion.li
                  key={c.id}
                  initial={{ opacity: 0, x: right ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className={clsx("relative flex items-center gap-4 md:w-1/2", right ? "md:ml-auto md:pl-10" : "md:flex-row-reverse md:pr-10 md:text-right")}
                >
                  <div
                    className={clsx(
                      "relative z-10 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-4 font-display text-lg md:absolute md:top-1/2 md:-translate-y-1/2",
                      right ? "md:-left-[26px]" : "md:-right-[26px]",
                      state === "done" && "border-green-400 bg-green-500 text-white shadow-[0_0_20px_#22c55e88]",
                      state === "doing" && "border-amber-300 bg-amber-400 text-slate-900 shadow-[0_0_20px_#f59e0b88]",
                      state === "todo" && "border-white/20 bg-asphalt-800 text-white/70",
                    )}
                  >
                    {c.id}
                    {hydrated && i === current && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-lane px-1.5 py-0.5 text-[10px] font-extrabold text-slate-900">BẠN ĐANG Ở ĐÂY</span>
                    )}
                  </div>
                  <Link
                    href={`${base}/on-tap/chuong-${c.id}`}
                    className="group flex-1 rounded-2xl bg-asphalt-850 p-4 ring-1 ring-white/10 transition hover:bg-asphalt-800 hover:ring-lane/40"
                  >
                    <div className={clsx("flex items-center gap-2", !right && "md:flex-row-reverse")}>
                      <span className="text-2xl">{c.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white">{c.short}</div>
                        <div className="truncate text-xs text-white/50">{c.name}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div className={clsx("h-full rounded-full", state === "done" ? "bg-green-500" : "bg-amber-400")} style={{ width: `${pct * 100}%` }} />
                      </div>
                      <span className="font-hud text-xs text-white/60">
                        {ch.mastered}/{ch.total}
                      </span>
                    </div>
                  </Link>
                </motion.li>
              );
            })}
            <li className="relative flex items-center gap-4 md:justify-center">
              <div className="relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full border-4 border-white bg-[conic-gradient(#111_0_25%,#fff_0_50%,#111_0_75%,#fff_0)] text-lg" />
              <Link href={`${base}/thi-thu`} className="font-display text-lg text-lane hover:underline md:absolute md:left-1/2 md:ml-10">
                ĐÍCH: THI THỬ →
              </Link>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-lg bg-white/5 px-2.5 py-1 text-white/70 ring-1 ring-white/10">{children}</span>;
}

function Metric({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-white/10 p-4 text-center [&:not(:last-child)]:border-r">
      <div className="font-hud text-xl font-bold text-white">{v}</div>
      <div className="text-xs text-white/50">{k}</div>
    </div>
  );
}

function QuickSet({ href, icon, title, desc, tone }: { href: string; icon: React.ReactNode; title: string; desc: string; tone: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-3xl bg-asphalt-850 p-4 ring-1 ring-white/10 transition hover:bg-asphalt-800">
      <span className={clsx("flex h-11 w-11 items-center justify-center rounded-2xl ring-1", tone)}>{icon}</span>
      <div className="min-w-0">
        <div className="font-bold text-white">{title}</div>
        <div className="truncate text-xs text-white/50">{desc}</div>
      </div>
      <ChevronRight className="ml-auto h-5 w-5 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white/70" />
    </Link>
  );
}
