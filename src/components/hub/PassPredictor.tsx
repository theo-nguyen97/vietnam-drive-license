"use client";

import { useMemo } from "react";
import clsx from "clsx";
import type { LicenseId } from "@/lib/types";
import { useExamVersion, useHydrated, useProgress } from "@/store/progress";
import { predictPass } from "@/lib/predict";

const TONE = {
  red: { stroke: "#ef4444", text: "text-red-300" },
  amber: { stroke: "#f59e0b", text: "text-amber-300" },
  green: { stroke: "#22c55e", text: "text-green-300" },
};

/** Vòng tròn "Khả năng đậu" + lý do. */
export function PassPredictor({ license, compact = false }: { license: LicenseId; compact?: boolean }) {
  const hydrated = useHydrated();
  const stats = useProgress((s) => s.stats);
  const exams = useProgress((s) => s.exams);
  const version = useExamVersion();
  const pred = useMemo(() => (hydrated ? predictPass(license, version, stats, exams) : null), [hydrated, license, version, stats, exams]);

  const pct = pred ? Math.round(pred.p * 100) : 0;
  const tone = TONE[pred?.tone ?? "red"];
  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <div className={clsx("flex items-center gap-4", compact ? "" : "flex-col sm:flex-row lg:flex-col")}>
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx={60} cy={60} r={R} fill="none" stroke="#ffffff14" strokeWidth={11} />
          <circle
            cx={60}
            cy={60}
            r={R}
            fill="none"
            stroke={tone.stroke}
            strokeWidth={11}
            strokeLinecap="round"
            strokeDasharray={`${(C * pct) / 100} ${C}`}
            style={{ transition: "stroke-dasharray .8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-hud text-3xl text-white">{pred ? `${pct}%` : "–"}</span>
          <span className="text-[0.625rem] font-bold uppercase tracking-wider text-white/50">khả năng đậu</span>
        </div>
      </div>
      {!compact && pred && (
        <div className="min-w-0">
          <div className={clsx("font-display text-lg", tone.text)}>{pred.label}</div>
          <ul className="mt-1.5 space-y-1 text-[0.8125rem]">
            {pred.reasons.map((r) => (
              <li key={r.text} className={clsx("flex gap-1.5", r.good ? "text-white/70" : "text-white/85")}>
                <span>{r.icon}</span>
                <span>{r.text}</span>
              </li>
            ))}
          </ul>
          {pred.confidence !== "high" && (
            <p className="mt-2 text-[0.6875rem] text-white/40">
              Độ tin cậy {pred.confidence === "low" ? "thấp" : "trung bình"} — học thêm câu để dự đoán chính xác hơn.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
