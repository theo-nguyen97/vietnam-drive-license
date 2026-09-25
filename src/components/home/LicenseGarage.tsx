"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FAMILIES, LICENSES } from "@/data/licenses";
import { useHydrated, useProgress } from "@/store/progress";
import { licenseProgress } from "@/lib/stats";
import { VehicleIcon } from "@/components/ui/VehicleIcon";

export function LicenseGarage() {
  const hydrated = useHydrated();
  const stats = useProgress((s) => s.stats);
  const exams = useProgress((s) => s.exams);
  const last = useProgress((s) => s.lastLicense);

  return (
    <div className="flex flex-col gap-10">
      {FAMILIES.map((fam) => {
        const list = LICENSES.filter((l) => l.family === fam.id);
        return (
          <section key={fam.id}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold text-white">{fam.name}</h3>
              <span className="font-hud text-xs text-white/40">{fam.hint}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((l, i) => {
                const p = hydrated ? licenseProgress(l.id, stats, exams) : null;
                return (
                  <motion.div key={l.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link
                      href={`/hang/${l.id.toLowerCase()}`}
                      className="group relative flex h-full items-stretch overflow-hidden rounded-2xl bg-asphalt-850 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:ring-2"
                      style={{ ["--c" as string]: l.color }}
                    >
                      <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: l.color }} />
                      <div className="flex flex-1 flex-col gap-2 p-4 pl-5">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-3xl leading-none text-white">{l.id}</span>
                          {last === l.id && hydrated && <span className="rounded-md bg-lane px-1.5 py-0.5 text-[0.625rem] font-extrabold text-slate-900">ĐANG HỌC</span>}
                        </div>
                        <p className="text-sm font-semibold text-white/80">{l.short}</p>
                        <p className="font-hud text-xs text-white/45">
                          {l.exam.total} câu · {l.exam.minutes} phút · đạt {l.exam.pass}
                        </p>
                        <div className="mt-auto pt-2">
                          <div className="flex items-center justify-between text-[0.6875rem] text-white/50">
                            <span>Đã thuộc</span>
                            <span className="font-hud">{p ? `${p.mastered}/${p.total}` : "–"}</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full transition-all" style={{ width: `${(p?.pct ?? 0) * 100}%`, background: l.color }} />
                          </div>
                        </div>
                      </div>
                      <div className="relative flex w-28 shrink-0 items-end justify-center bg-gradient-to-b from-transparent to-black/30 pb-2">
                        <div className="absolute inset-x-0 bottom-0 h-8 bg-asphalt-700/60" />
                        <VehicleIcon kind={l.vehicle} className="relative w-24 transition group-hover:scale-105" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
