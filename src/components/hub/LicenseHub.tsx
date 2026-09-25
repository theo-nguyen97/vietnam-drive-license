"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Trophy, AlertTriangle, RotateCcw, Bookmark, ListOrdered, ChevronRight, Dices, CalendarCheck, Gauge as GaugeIcon, Target, Stethoscope } from "lucide-react";
import { setCount } from "@/lib/exam";
import { dailySet, dueQuestions } from "@/lib/sets";
import { analyze } from "@/lib/topics";
import clsx from "clsx";
import type { LicenseId } from "@/lib/types";
import { examConfig, getLicense } from "@/data/licenses";
import { CHAPTERS } from "@/data/chapters";
import { useExamVersion, useHydrated, useProgress } from "@/store/progress";
import { ExamChangeBanner } from "@/components/ui/ExamChangeBanner";
import { OfflineDownload } from "@/components/ui/OfflineDownload";
import { licenseProgress } from "@/lib/stats";
import { questionsFor } from "@/data/questions";
import { VehicleIcon } from "@/components/ui/VehicleIcon";
import { PassPredictor } from "./PassPredictor";

export function LicenseHub({ license }: { license: LicenseId }) {
  const lic = getLicense(license)!;
  const hydrated = useHydrated();
  const version = useExamVersion();
  const cfg = examConfig(lic, version);
  const stats = useProgress((s) => s.stats);
  const exams = useProgress((s) => s.exams);
  const bookmarks = useProgress((s) => s.bookmarks);
  const p = licenseProgress(license, hydrated ? stats : {}, hydrated ? exams : []);
  const chapters = CHAPTERS.filter((c) => c.groups.includes(lic.group));
  const base = `/hang/${license.toLowerCase()}`;
  const allIds = new Set(questionsFor(license).map((q) => q.id));
  const saved = hydrated ? bookmarks.filter((b) => allIds.has(b)).length : 0;
  const pool = questionsFor(license);
  const dueCount = hydrated ? dueQuestions(pool, stats).length : 0;
  const dailyCount = hydrated ? dailySet(pool, stats).length : 0;
  const arcadeBest = useProgress((s) => s.arcadeBest[license] ?? 0);
  const topWeak = hydrated ? analyze(license, stats).find((r) => r.status === "danger" || r.status === "warn") : undefined;
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
              <Pill>Bộ {lic.bank} câu</Pill>
              <Pill>
                Đề thi: {cfg.total} câu / {cfg.minutes} phút
              </Pill>
              <Pill>
                Đạt: {cfg.pass}/{cfg.total}
              </Pill>
            </div>
          </div>
          <div className="rounded-3xl bg-black/25 p-4 ring-1 ring-white/10 md:w-72">
            <PassPredictor license={license} />
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

      <div className="mt-6">
        <ExamChangeBanner license={license} />
      </div>

      {/* Hành động nhanh */}
      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link
          href={`${base}/bo-de`}
          className="group relative flex items-center gap-4 overflow-hidden rounded-3xl bg-[linear-gradient(180deg,#ffe57a_0%,#ffd23f_45%,#f5b700_100%)] p-5 text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,.7),0_6px_0_#a87800,0_18px_40px_-10px_rgba(255,200,40,.5)] transition duration-150 hover:-translate-y-0.5 active:translate-y-1.5 active:shadow-[0_1px_0_#a87800] col-span-2"
        >
          <div className="hazard-stripes absolute inset-y-0 right-0 w-10 opacity-50" />
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950/90 text-lane">
            <Trophy className="h-7 w-7" />
          </span>
          <div>
            <div className="font-display text-xl leading-tight sm:text-2xl">BỘ ĐỀ {version === "tt108" ? "2027" : "2026"} · {setCount(license)} ĐỀ</div>
            <div className="text-xs font-semibold opacity-80 sm:text-sm">
              {cfg.total} câu · {cfg.minutes} phút · đạt {cfg.pass}
              <span className="hidden sm:inline"> · theo Thông tư {version === "tt108" ? "108/2026" : "12/2025"}/TT-BCA</span>
            </div>
          </div>
          <ChevronRight className="ml-auto mr-6 h-6 w-6 shrink-0 transition group-hover:translate-x-1 sm:mr-8" />
        </Link>
        <Link
          href={`${base}/on-tap/hom-nay`}
          className="group relative flex items-center gap-4 overflow-hidden rounded-3xl bg-[linear-gradient(180deg,#34d399_0%,#10b981_50%,#059669_100%)] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_6px_0_#065f46,0_18px_40px_-12px_rgba(16,185,129,.55)] transition duration-150 hover:-translate-y-0.5 active:translate-y-1.5 active:shadow-[0_1px_0_#065f46] col-span-2"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950/85 text-emerald-300">
            <CalendarCheck className="h-7 w-7" />
          </span>
          <div>
            <div className="font-display text-xl leading-tight sm:text-2xl">ÔN TẬP HÔM NAY</div>
            <div className="text-sm font-semibold text-white/90">
              {hydrated ? `${Math.min(dueCount, dailyCount)} câu đến hạn ôn · ${Math.max(0, dailyCount - dueCount)} câu mới` : "Lặp lại ngắt quãng — nhớ lâu hơn"}
            </div>
          </div>
          <ChevronRight className="ml-auto h-6 w-6 transition group-hover:translate-x-1" />
        </Link>
        <QuickSet
          href={`${base}/diem-yeu`}
          icon={<Stethoscope className="h-5 w-5" />}
          title="Luyện điểm yếu"
          desc={topWeak ? `Lỗi ${topWeak.topic.code}: ${topWeak.topic.name}` : "Chẩn đoán lỗi hay mắc"}
          tone="text-cyan-300 bg-cyan-500/10 ring-cyan-400/25"
        />
        <QuickSet
          href={`${base}/thu-thach`}
          icon={<GaugeIcon className="h-5 w-5" />}
          title="Thử thách 12 điểm"
          desc={arcadeBest ? `Kỷ lục ${arcadeBest.toLocaleString("vi-VN")}` : "Giữ bằng lâu nhất có thể"}
          tone="text-rose-300 bg-rose-500/10 ring-rose-400/25"
        />
        <QuickSet href={`${base}/thi-thu`} icon={<Dices className="h-5 w-5" />} title="Thi thử ngẫu nhiên" desc="Đề trộn mới mỗi lần" tone="text-lane bg-lane/10 ring-lane/25" />
        <QuickSet href={`${base}/on-tap/diem-liet`} icon={<AlertTriangle className="h-5 w-5" />} title="Câu điểm liệt" desc={`${p.critical} câu — sai là trượt`} tone="text-red-300 bg-red-500/10 ring-red-400/25" />
        <QuickSet href={`${base}/on-tap/cau-sai`} icon={<RotateCcw className="h-5 w-5" />} title="Câu hay sai" desc={hydrated ? `${p.wrong} câu cần ôn lại` : "Ôn lại câu sai"} tone="text-orange-300 bg-orange-500/10 ring-orange-400/25" />
        <QuickSet href={`${base}/on-tap/da-luu`} icon={<Bookmark className="h-5 w-5" />} title="Câu đã lưu" desc={`${saved} câu`} tone="text-violet-300 bg-violet-500/10 ring-violet-400/25" />
        <QuickSet href={`${base}/on-tap/tat-ca`} icon={<ListOrdered className="h-5 w-5" />} title="Toàn bộ câu hỏi" desc={`${p.total} câu theo thứ tự`} tone="text-emerald-300 bg-emerald-500/10 ring-emerald-400/25" />
        <QuickSet href="/san-bien-bao" icon={<Target className="h-5 w-5" />} title="Săn biển báo" desc="Mini game 60 giây" tone="text-cyan-300 bg-cyan-500/10 ring-cyan-400/25" />
      </section>

      <div className="mt-6">
        <OfflineDownload license={license} />
      </div>

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
                      <span className="absolute -top-7 left-0 whitespace-nowrap rounded-md bg-lane md:left-1/2 md:-translate-x-1/2 px-1.5 py-0.5 text-[0.625rem] font-extrabold text-slate-900">BẠN ĐANG Ở ĐÂY</span>
                    )}
                  </div>
                  <Link
                    href={`${base}/on-tap/chuong-${c.id}`}
                    className="group min-w-0 flex-1 rounded-2xl bg-asphalt-850 p-4 ring-1 ring-white/10 transition hover:bg-asphalt-800 hover:ring-lane/40"
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
              <Link href={`${base}/bo-de`} className="font-display text-lg text-lane hover:underline md:absolute md:left-1/2 md:ml-10">
                ĐÍCH: BỘ ĐỀ 2026 →
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
    <Link
      href={href}
      className="group flex min-w-0 flex-col items-start gap-2 rounded-3xl bg-[linear-gradient(180deg,#222834,#1a1f29)] p-3.5 ring-1 ring-inset ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.07),0_5px_0_#0b0d12] transition duration-150 hover:-translate-y-0.5 hover:ring-white/20 active:translate-y-1 active:shadow-none sm:flex-row sm:items-center sm:gap-3 sm:p-4"
    >
      <span className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 sm:h-11 sm:w-11", tone)}>{icon}</span>
      <div className="min-w-0">
        <div className="text-sm font-bold leading-tight text-white sm:text-base">{title}</div>
        <div className="mt-0.5 line-clamp-2 text-[0.6875rem] leading-snug text-white/50 sm:truncate sm:text-xs">{desc}</div>
      </div>
      <ChevronRight className="ml-auto hidden h-5 w-5 shrink-0 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white/70 sm:block" />
    </Link>
  );
}
