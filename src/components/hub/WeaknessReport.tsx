"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ScanLine, Stethoscope, Trophy, CalendarCheck } from "lucide-react";
import clsx from "clsx";
import type { LicenseId } from "@/lib/types";
import { getLicense } from "@/data/licenses";
import { useHydrated, useProgress } from "@/store/progress";
import { analyze, type TopicReport, type TopicStatus } from "@/lib/topics";
import { ButtonLink } from "@/components/ui/Button";

const STATUS: Record<TopicStatus, { label: string; dot: string; text: string; ring: string }> = {
  danger: { label: "Hay sai", dot: "bg-red-500 shadow-[0_0_12px_#ef4444]", text: "text-red-300", ring: "ring-red-500/40" },
  warn: { label: "Cần chú ý", dot: "bg-amber-400 shadow-[0_0_12px_#f59e0b]", text: "text-amber-300", ring: "ring-amber-400/30" },
  good: { label: "Ổn định", dot: "bg-green-500 shadow-[0_0_12px_#22c55e]", text: "text-green-300", ring: "ring-white/10" },
  unknown: { label: "Chưa đủ dữ liệu", dot: "bg-white/20", text: "text-white/45", ring: "ring-white/10" },
};

export function WeaknessReport({ license }: { license: LicenseId }) {
  const lic = getLicense(license)!;
  const hydrated = useHydrated();
  const stats = useProgress((s) => s.stats);
  const reports = analyze(license, hydrated ? stats : {});
  const base = `/hang/${license.toLowerCase()}`;
  const attempts = reports.reduce((a, r) => a + r.attempts, 0);
  const weak = reports.filter((r) => r.status === "danger" || r.status === "warn");
  const count = (s: TopicStatus) => reports.filter((r) => r.status === s).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
      <Link href={base} className="text-sm font-semibold text-white/55 hover:text-white">
        ← Hạng {lic.id}
      </Link>

      {/* Máy quét */}
      <section className="relative mt-3 overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#0f1f2e,#0b1219)] p-5 ring-1 ring-cyan-400/20 sm:p-7">
        <motion.div
          className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent"
          initial={{ top: "-30%" }}
          animate={{ top: "110%" }}
          transition={{ duration: 2.4, ease: "easeInOut", repeat: 1 }}
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 font-hud text-xs uppercase tracking-[0.25em] text-cyan-300">
              <ScanLine className="h-4 w-4" /> Chẩn đoán tay lái · OBD
            </p>
            <h1 className="mt-1 font-display text-3xl text-white sm:text-4xl">Luyện theo lỗi hay mắc</h1>
            <p className="mt-2 max-w-xl text-sm text-white/65 sm:text-base">
              Hệ thống phân tích {attempts} lượt trả lời trên {reports.length} chủ đề nhỏ của hạng {lic.id}, tìm chỗ bạn hay sai và ra bài luyện đúng chỗ đó.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {(["danger", "warn", "good", "unknown"] as TopicStatus[]).map((s) => (
              <div key={s} className="flex flex-col items-center gap-1.5 rounded-2xl bg-black/30 px-2 py-3 ring-1 ring-white/10 sm:px-3">
                <span className={clsx("h-3.5 w-3.5 rounded-full", STATUS[s].dot)} />
                <span className="font-hud text-xl text-white">{hydrated ? count(s) : "–"}</span>
                <span className="text-center text-[10px] leading-tight text-white/50">{STATUS[s].label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {hydrated && attempts < 6 ? (
        <section className="mt-6 rounded-3xl bg-asphalt-850 p-6 text-center ring-1 ring-white/10">
          <Stethoscope className="mx-auto h-10 w-10 text-cyan-300" />
          <h2 className="mt-3 text-xl font-bold text-white">Chưa đủ dữ liệu để chẩn đoán</h2>
          <p className="mx-auto mt-1 max-w-md text-white/60">
            Hãy làm một đề trong Bộ đề 2026 hoặc ôn khoảng 20 câu — máy quét sẽ chỉ ra chủ đề bạn cần luyện thêm.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <ButtonLink href={`${base}/bo-de`} icon={<Trophy className="h-4 w-4" />}>
              Làm bộ đề
            </ButtonLink>
            <ButtonLink href={`${base}/on-tap/hom-nay`} variant="secondary" icon={<CalendarCheck className="h-4 w-4" />}>
              Ôn tập hôm nay
            </ButtonLink>
          </div>
        </section>
      ) : (
        <>
          {weak.length > 0 ? (
            <section className="mt-6">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-lg font-bold text-white">Mã lỗi phát hiện</h2>
                <ButtonLink href={`${base}/on-tap/diem-yeu`} icon={<Stethoscope className="h-4 w-4" />}>
                  Luyện tổng hợp điểm yếu
                </ButtonLink>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {weak.slice(0, 3).map((r, i) => (
                  <motion.div key={r.topic.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.12 }}>
                    <Link
                      href={`${base}/on-tap/chu-de-${r.topic.id}`}
                      className={clsx(
                        "group flex h-full flex-col rounded-3xl bg-[linear-gradient(180deg,#2a1c20,#1c1518)] p-5 ring-1 shadow-[0_5px_0_#0b0d12] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-none",
                        r.status === "danger" ? "ring-red-500/50" : "ring-amber-400/40",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={clsx("rounded-lg px-2 py-0.5 font-hud text-sm", r.status === "danger" ? "bg-red-500/20 text-red-300" : "bg-amber-400/15 text-amber-300")}>
                          {r.topic.code}
                        </span>
                        <span className="text-2xl">{r.topic.icon}</span>
                      </div>
                      <h3 className="mt-3 font-bold leading-snug text-white">{r.topic.name}</h3>
                      <p className="mt-1 text-xs text-white/50">{r.topic.hint}</p>
                      <div className="mt-auto pt-4">
                        <div className="flex justify-between font-hud text-xs text-white/60">
                          <span>Đúng {Math.round((r.accuracy ?? 0) * 100)}%</span>
                          <span>{r.wrongNow} câu đang sai</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className={clsx("h-full rounded-full", r.status === "danger" ? "bg-red-500" : "bg-amber-400")} style={{ width: `${(r.accuracy ?? 0) * 100}%` }} />
                        </div>
                        <div className="mt-3 text-sm font-bold text-lane group-hover:underline">Sửa lỗi này →</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          ) : (
            <section className="mt-6 rounded-3xl bg-green-500/10 p-5 text-center ring-1 ring-green-500/30">
              <p className="text-lg font-bold text-green-300">✓ Không phát hiện lỗi đáng kể — tay lái đang rất ổn!</p>
              <p className="text-sm text-white/60">Tiếp tục làm bộ đề để máy quét cập nhật.</p>
            </section>
          )}

          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold text-white">Toàn bộ chủ đề</h2>
            <div className="flex flex-col gap-2">
              {reports.map((r) => (
                <TopicRow key={r.topic.id} r={r} href={`${base}/on-tap/chu-de-${r.topic.id}`} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function TopicRow({ r, href }: { r: TopicReport; href: string }) {
  const st = STATUS[r.status];
  return (
    <Link href={href} className={clsx("group flex items-center gap-3 rounded-2xl bg-asphalt-850 p-3 ring-1 transition hover:bg-asphalt-800 sm:gap-4 sm:p-4", st.ring)}>
      <span className={clsx("h-3 w-3 shrink-0 rounded-full", st.dot)} />
      <span className="hidden w-12 shrink-0 font-hud text-xs text-white/40 sm:block">{r.topic.code}</span>
      <span className="text-xl">{r.topic.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold text-white sm:text-base">{r.topic.name}</span>
          <span className={clsx("shrink-0 text-xs font-semibold", st.text)}>{st.label}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className={clsx("h-full rounded-full", r.status === "danger" ? "bg-red-500" : r.status === "warn" ? "bg-amber-400" : "bg-green-500")}
              style={{ width: `${(r.accuracy ?? 0) * 100}%` }}
            />
          </div>
          <span className="w-24 shrink-0 text-right font-hud text-[11px] text-white/50">
            {r.seen}/{r.total} câu{r.wrongNow ? ` · ${r.wrongNow} sai` : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}
