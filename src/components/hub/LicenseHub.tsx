"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Trophy, AlertTriangle, RotateCcw, Bookmark, ListOrdered, ChevronRight, Dices, CalendarCheck,
  Gauge as GaugeIcon, Target, Stethoscope, ArrowRight, Repeat, Lightbulb, Clapperboard,
} from "lucide-react";
import clsx from "clsx";
import type { LicenseId } from "@/lib/types";
import { examConfig, getLicense } from "@/data/licenses";
import { CHAPTERS } from "@/data/chapters";
import { questionsFor } from "@/data/questions";
import { SORTED_NEWS } from "@/data/news";
import { examSets, setCount } from "@/lib/exam";
import { dailySet, dueQuestions } from "@/lib/sets";
import { analyze } from "@/lib/topics";
import { licenseProgress } from "@/lib/stats";
import { useExamVersion, useHydrated, useProgress } from "@/store/progress";
import { PassPredictor } from "./PassPredictor";

/** Trang học của một hạng — cũng là trang chủ (home) khi người dùng đã chọn hạng. */
export function LicenseHub({ license, home = false }: { license: LicenseId; home?: boolean }) {
  const lic = getLicense(license)!;
  const hydrated = useHydrated();
  const version = useExamVersion();
  const cfg = examConfig(lic, version);
  const stats = useProgress((s) => s.stats);
  const exams = useProgress((s) => s.exams);
  const bookmarks = useProgress((s) => s.bookmarks);
  const name = useProgress((s) => s.driverName);
  const arcadeBest = useProgress((s) => s.arcadeBest[license] ?? 0);
  const p = licenseProgress(license, hydrated ? stats : {}, hydrated ? exams : []);
  const chapters = CHAPTERS.filter((c) => c.groups.includes(lic.group));
  const base = `/hang/${license.toLowerCase()}`;
  const pool = questionsFor(license);
  const allIds = new Set(pool.map((q) => q.id));
  const saved = hydrated ? bookmarks.filter((b) => allIds.has(b)).length : 0;
  const dueCount = hydrated ? dueQuestions(pool, stats).length : 0;
  const dailyCount = hydrated ? dailySet(pool, stats).length : 0;
  const topWeak = hydrated ? analyze(license, stats).find((r) => r.status === "danger" || r.status === "warn") : undefined;
  const current = chapters.findIndex((c) => {
    const ch = p.chapters[c.id];
    return !ch || ch.mastered / ch.total < 0.8;
  });
  const sets = examSets(license, version);
  const nextSet = hydrated
    ? sets.findIndex((_, i) => !exams.some((e) => e.license === license && e.setNo === i + 1 && e.passed && (e.version ?? "tt12") === version)) + 1
    : 1;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      {/* Đầu trang: hạng đang học */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 min-w-12 items-center justify-center rounded-2xl px-2.5 font-display text-2xl text-slate-900" style={{ background: lic.color }}>
            {lic.id}
          </span>
          <div>
            <p className="text-sm text-white/55">{home ? `Chào ${name.trim() || "bạn"} 👋` : "Giấy phép lái xe"}</p>
            <h1 className="font-display text-2xl leading-tight text-white sm:text-3xl">{home ? `Luyện thi hạng ${lic.id}` : `GPLX ${lic.name}`}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden rounded-xl bg-white/5 px-3 py-2 text-white/60 ring-1 ring-white/10 sm:inline">
            {version === "tt108" ? "Đề từ 01/3/2027" : "Đề hiện hành"} · {cfg.total} câu · đạt {cfg.pass}
          </span>
          <Link href="/chon-hang" className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 font-semibold text-white/80 ring-1 ring-white/10 hover:bg-white/10">
            <Repeat className="h-4 w-4" /> Đổi hạng
          </Link>
        </div>
      </header>

      {/* Hôm nay */}
      <section className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-asphalt-850 p-5 ring-1 ring-white/10 sm:p-6">
          <div className="absolute inset-0 opacity-25" style={{ background: `radial-gradient(circle at 90% 10%, ${lic.color}, transparent 55%)` }} />
          <div className="relative">
            <p className="font-hud text-xs uppercase tracking-[0.2em] text-lane">Hôm nay</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Link
                href={`${base}/on-tap/hom-nay`}
                className="group flex items-center gap-4 rounded-2xl bg-[linear-gradient(180deg,#34d399_0%,#10b981_50%,#059669_100%)] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_5px_0_#065f46] transition duration-150 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
              >
                <CalendarCheck className="h-8 w-8 shrink-0" />
                <div className="min-w-0">
                  <div className="font-display text-xl leading-tight">Ôn tập hôm nay</div>
                  <div className="text-sm font-semibold text-white/90">
                    {hydrated ? `${Math.min(dueCount, dailyCount)} câu đến hạn · ${Math.max(0, dailyCount - dueCount)} câu mới` : "Lặp lại ngắt quãng"}
                  </div>
                </div>
                <ArrowRight className="ml-auto h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href={`${base}/bo-de/${Math.max(1, Math.min(nextSet || setCount(license), setCount(license)))}`}
                className="group flex items-center gap-4 rounded-2xl bg-[linear-gradient(180deg,#ffe57a_0%,#ffd23f_45%,#f5b700_100%)] p-4 text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,.7),0_5px_0_#a87800] transition duration-150 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
              >
                <Trophy className="h-8 w-8 shrink-0" />
                <div className="min-w-0">
                  <div className="font-display text-xl leading-tight">Làm đề số {nextSet || 1}</div>
                  <div className="text-sm font-semibold opacity-80">
                    {cfg.total} câu · {cfg.minutes} phút · {p.passed} đề đã đạt
                  </div>
                </div>
                <ArrowRight className="ml-auto h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-xs text-white/55">
                <span>Đã thuộc {p.mastered}/{p.total} câu</span>
                <span>Điểm liệt {p.criticalMastered}/{p.critical}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full transition-all" style={{ width: `${p.pct * 100}%`, background: lic.color }} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-asphalt-850 p-5 ring-1 ring-white/10">
          <PassPredictor license={license} />
        </div>
      </section>

      {/* Luyện tập */}
      <SectionTitle title="Luyện tập" />
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <QuickSet
          href={`${base}/diem-yeu`}
          icon={<Stethoscope className="h-5 w-5" />}
          title="Luyện điểm yếu"
          desc={topWeak ? `Lỗi ${topWeak.topic.code}: ${topWeak.topic.name}` : "Chẩn đoán lỗi hay mắc"}
          tone="text-cyan-300 bg-cyan-500/10 ring-cyan-400/25"
        />
        <QuickSet href={`${base}/on-tap/diem-liet`} icon={<AlertTriangle className="h-5 w-5" />} title="Câu điểm liệt" desc={`${p.critical} câu — sai là trượt`} tone="text-red-300 bg-red-500/10 ring-red-400/25" />
        <QuickSet href={`${base}/on-tap/cau-sai`} icon={<RotateCcw className="h-5 w-5" />} title="Câu hay sai" desc={hydrated ? `${p.wrong} câu cần ôn lại` : "Ôn lại câu sai"} tone="text-orange-300 bg-orange-500/10 ring-orange-400/25" />
        <QuickSet href={`${base}/on-tap/da-luu`} icon={<Bookmark className="h-5 w-5" />} title="Câu đã lưu" desc={`${saved} câu`} tone="text-violet-300 bg-violet-500/10 ring-violet-400/25" />
        <QuickSet
          href={`${base}/on-tap/tat-ca`}
          icon={<ListOrdered className="h-5 w-5" />}
          title="Toàn bộ câu hỏi"
          desc={`${p.total} câu theo thứ tự`}
          tone="text-emerald-300 bg-emerald-500/10 ring-emerald-400/25"
        />
        <QuickSet
          href={`${base}/on-tap/mo-phong`}
          icon={<Clapperboard className="h-5 w-5" />}
          title="Tình huống mô phỏng"
          desc={`${pool.filter((q) => q.scene || q.consequences).length} câu có hình động — chọn sai xem hậu quả`}
          tone="text-red-300 bg-red-500/10 ring-red-400/25"
        />
        <QuickSet
          href={`${base}/on-tap/co-meo`}
          icon={<Lightbulb className="h-5 w-5" />}
          title="Học theo mẹo"
          desc={`${pool.filter((q) => q.tip).length} câu có mẹo nhớ · xem trang Học mẹo`}
          tone="text-amber-300 bg-amber-500/10 ring-amber-400/25"
          className="col-span-2 sm:col-span-1"
        />
      </section>

      {/* Bản đồ hành trình */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-white">Ôn theo chương</h2>
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
                ĐÍCH: BỘ ĐỀ {version === "tt108" ? "2027" : "2026"} →
              </Link>
            </li>
          </ol>
        </div>
      </section>

      {/* Thử thách */}
      <SectionTitle title="Thử thách" />
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <QuickSet
          href={`${base}/thu-thach`}
          icon={<GaugeIcon className="h-5 w-5" />}
          title="Thử thách 12 điểm"
          desc={arcadeBest ? `Kỷ lục ${arcadeBest.toLocaleString("vi-VN")}` : "Giữ bằng lâu nhất có thể"}
          tone="text-rose-300 bg-rose-500/10 ring-rose-400/25"
        />
        <QuickSet href={`${base}/thi-thu`} icon={<Dices className="h-5 w-5" />} title="Thi thử ngẫu nhiên" desc="Đề trộn mới mỗi lần" tone="text-lane bg-lane/10 ring-lane/25" />
        <QuickSet href={`${base}/bo-de`} icon={<Trophy className="h-5 w-5" />} title={`Bộ ${setCount(license)} đề`} desc="Xem kết quả từng đề" tone="text-amber-300 bg-amber-500/10 ring-amber-400/25" />
        <QuickSet href="/san-bien-bao" icon={<Target className="h-5 w-5" />} title="Săn biển báo" desc="Mini game 60 giây" tone="text-sky-300 bg-sky-500/10 ring-sky-400/25" />
      </section>

      {home && (
        <>
          <SectionTitle title="Tin tức & luật mới" href="/tin-tuc" />
          <section className="grid gap-3 md:grid-cols-3">
            {SORTED_NEWS.slice(0, 3).map((n) => (
              <Link key={n.slug} href={`/tin-tuc/${n.slug}`} className="group rounded-3xl bg-asphalt-850 p-4 ring-1 ring-white/10 transition hover:bg-asphalt-800 hover:ring-white/20">
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-semibold text-white/70">{n.category}</span>
                  <span className="text-white/40">{n.date}</span>
                </div>
                <h3 className="mt-2 font-bold leading-snug text-white group-hover:text-lane">{n.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-white/55">{n.summary}</p>
              </Link>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function SectionTitle({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-3 mt-8 flex items-end justify-between">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {href && (
        <Link href={href} className="text-sm font-semibold text-white/55 hover:text-white">
          Xem tất cả →
        </Link>
      )}
    </div>
  );
}

function QuickSet({ href, icon, title, desc, tone, className }: { href: string; icon: React.ReactNode; title: string; desc: string; tone: string; className?: string }) {
  return (
    <Link
      href={href}
      className={clsx(className, "group flex min-w-0 flex-col items-start gap-2 rounded-3xl bg-[linear-gradient(180deg,#222834,#1a1f29)] p-3.5 ring-1 ring-inset ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.07),0_5px_0_#0b0d12] transition duration-150 hover:-translate-y-0.5 hover:ring-white/20 active:translate-y-1 active:shadow-none sm:flex-row sm:items-center sm:gap-3 sm:p-4")}
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
