"use client";

import clsx from "clsx";
import type { LicenseId } from "@/lib/types";
import { getLicense } from "@/data/licenses";
import { useProgress, useExamVersion } from "@/store/progress";

/** Chọn cấu trúc đề: hiện hành (TT12) hoặc từ 01/3/2027 (TT108). */
export function ExamVersionSwitch({ license, className }: { license: LicenseId; className?: string }) {
  const lic = getLicense(license)!;
  const version = useExamVersion();
  const setVersion = useProgress((s) => s.setExamVersion);
  const opts = [
    { v: "tt12" as const, title: "Đề hiện hành", sub: `${lic.exam.total} câu · đạt ${lic.exam.pass} · TT12/2025` },
    { v: "tt108" as const, title: "Đề từ 01/3/2027", sub: `${lic.exam2027.total} câu · đạt ${lic.exam2027.pass} · TT108/2026` },
  ];
  return (
    <div role="radiogroup" aria-label="Cấu trúc đề thi" className={clsx("grid grid-cols-2 gap-1 rounded-2xl bg-black/30 p-1 ring-1 ring-white/10", className)}>
      {opts.map((o) => {
        const active = version === o.v;
        return (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setVersion(o.v)}
            className={clsx(
              "rounded-xl px-3 py-2 text-left transition",
              active ? "bg-[linear-gradient(180deg,#ffe57a,#f5b700)] text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,.6),0_2px_0_#a87800]" : "text-white/70 hover:bg-white/5",
            )}
          >
            <div className="text-sm font-extrabold leading-tight">
              {o.title}
              {o.v === "tt108" && <span className={clsx("ml-1.5 rounded px-1 text-[0.625rem]", active ? "bg-slate-950 text-lane" : "bg-lane/20 text-lane")}>MỚI</span>}
            </div>
            <div className={clsx("text-[0.6875rem] font-semibold", active ? "text-slate-800" : "text-white/45")}>{o.sub}</div>
          </button>
        );
      })}
    </div>
  );
}
