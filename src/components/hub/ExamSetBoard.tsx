"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Shuffle, CheckCircle2, XCircle, CircleDashed } from "lucide-react";
import clsx from "clsx";
import type { LicenseId } from "@/lib/types";
import { examConfig, getLicense } from "@/data/licenses";
import { examPlan, examSets } from "@/lib/exam";
import { useExamVersion, useHydrated, useProgress } from "@/store/progress";
import { ExamVersionSwitch } from "@/components/ui/ExamVersionSwitch";
import { ButtonLink } from "@/components/ui/Button";

const GROUPS: [string, string][] = [
  ["1", "Quy định chung & quy tắc"],
  ["liet", "Điểm liệt"],
  ["2", "Văn hoá, đạo đức"],
  ["3", "Kỹ thuật lái xe"],
  ["4", "Cấu tạo, sửa chữa"],
  ["5", "Báo hiệu đường bộ"],
  ["6", "Sa hình"],
];

export function ExamSetBoard({ license }: { license: LicenseId }) {
  const lic = getLicense(license)!;
  const hydrated = useHydrated();
  const exams = useProgress((s) => s.exams);
  const version = useExamVersion();
  const cfg = examConfig(lic, version);
  const sets = examSets(license, version);
  const plan = examPlan(license, version);
  const base = `/hang/${license.toLowerCase()}`;

  const status = sets.map((_, i) => {
    const rec = hydrated ? exams.filter((e) => e.license === license && e.setNo === i + 1 && (e.version ?? "tt12") === version) : [];
    const best = rec.reduce((m, e) => Math.max(m, e.correct), -1);
    return { tries: rec.length, best, passed: rec.some((e) => e.passed) };
  });
  const passedCount = status.filter((s) => s.passed).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href={base} className="text-sm font-semibold text-white/55 hover:text-white">
            ← Hạng {lic.id}
          </Link>
          <p className="mt-3 font-hud text-sm uppercase tracking-[0.2em] text-lane">
            {version === "tt108" ? "Bộ đề 2027 · Thông tư 108/2026" : `Bộ đề 2026 · bộ ${lic.bank} câu`}
          </p>
          <h1 className="font-display text-3xl text-white sm:text-4xl">
            {sets.length} đề thi hạng {lic.id}
          </h1>
          <p className="mt-2 max-w-2xl text-white/65">
            Mỗi đề {cfg.total} câu · {cfg.minutes} phút · đạt từ {cfg.pass}/{cfg.total} câu và không sai câu điểm liệt. {version === "tt108"
              ? "Cấu trúc mới áp dụng từ 01/3/2027 (tỉ lệ từng nhóm là dự kiến)."
              : "Cấu trúc theo Thông tư 12/2025/TT-BCA."}
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-asphalt-850 px-5 py-4 ring-1 ring-white/10">
          <div>
            <div className="font-hud text-3xl text-white">
              {hydrated ? passedCount : 0}
              <span className="text-lg text-white/40">/{sets.length}</span>
            </div>
            <div className="text-xs text-white/50">đề đã đạt</div>
          </div>
          <ButtonLink href={`${base}/thi-thu`} variant="secondary" size="sm" icon={<Shuffle className="h-4 w-4" />}>
            Đề ngẫu nhiên
          </ButtonLink>
        </div>
      </div>

      <div className="mt-6 flex max-w-xl flex-col gap-1.5">
        <ExamVersionSwitch license={license} />
        <Link href="/tin-tuc/de-thi-2027" className="self-end text-xs font-semibold text-indigo-200 hover:underline">
          Đề từ 01/3/2027 thay đổi gì? →
        </Link>
      </div>

      {/* Cấu trúc đề */}
      <div className="mt-4 flex flex-wrap gap-2">
        {GROUPS.filter(([k]) => k === "liet" || plan[Number(k) as 1]).map(([k, name]) => (
          <span
            key={k}
            className={clsx(
              "flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm ring-1",
              k === "liet" ? "bg-red-500/10 text-red-200 ring-red-400/30" : "bg-white/5 text-white/75 ring-white/10",
            )}
          >
            <b className="font-hud text-base text-white">{k === "liet" ? 1 : plan[Number(k) as 1]}</b> {name}
          </span>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {sets.map((qs, i) => {
          const st = status[i];
          const state = st.passed ? "pass" : st.tries ? "fail" : "new";
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Link
                href={`${base}/bo-de/${i + 1}`}
                className={clsx(
                  "group relative flex h-full flex-col overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#232937,#1a1f2a)] p-4 ring-1 transition duration-150",
                  "shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_5px_0_#0b0d12] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none",
                  state === "pass" ? "ring-green-500/50" : state === "fail" ? "ring-red-500/40" : "ring-white/10 hover:ring-lane/50",
                )}
              >
                <span className="absolute inset-x-0 top-0 h-1" style={{ background: state === "pass" ? "#22c55e" : state === "fail" ? "#ef4444" : lic.color }} />
                <div className="flex items-start justify-between">
                  <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-white/45">Đề số</span>
                  {state === "pass" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : state === "fail" ? (
                    <XCircle className="h-5 w-5 text-red-400" />
                  ) : (
                    <CircleDashed className="h-5 w-5 text-white/25" />
                  )}
                </div>
                <div className="font-display text-5xl leading-none text-white transition group-hover:text-lane">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-3 text-xs text-white/50">
                  {qs.length} câu · {qs.filter((q) => q.scene?.kind === "junction").length} sa hình động
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={clsx("h-full rounded-full", state === "pass" ? "bg-green-500" : "bg-red-400")}
                    style={{ width: st.best >= 0 ? `${(st.best / cfg.total) * 100}%` : 0 }}
                  />
                </div>
                <div className="mt-1.5 font-hud text-xs text-white/60">
                  {st.best >= 0 ? `Cao nhất ${st.best}/${cfg.total} · ${st.tries} lần` : "Chưa làm"}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
