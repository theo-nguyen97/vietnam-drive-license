"use client";

import Link from "next/link";
import clsx from "clsx";
import { Volume2, VolumeX } from "lucide-react";
import { getLicense } from "@/data/licenses";
import { useHydrated, useProgress } from "@/store/progress";
import { ExamVersionSwitch } from "@/components/ui/ExamVersionSwitch";
import { OfflineDownload } from "@/components/ui/OfflineDownload";
import { FONT_SCALES } from "@/components/ui/FontSizeToggle";
import { VehicleIcon } from "@/components/ui/VehicleIcon";

const FONT_LABELS = ["Chuẩn", "Lớn", "Rất lớn"];

/** Cài đặt học tập: hạng bằng, cấu trúc đề, cỡ chữ, âm thanh, học offline. */
export function SettingsPanel() {
  const hydrated = useHydrated();
  const last = useProgress((s) => s.lastLicense);
  const scale = useProgress((s) => s.fontScale);
  const setScale = useProgress((s) => s.setFontScale);
  const sound = useProgress((s) => s.sound);
  const setSound = useProgress((s) => s.setSound);
  if (!hydrated) return <div className="h-64 animate-pulse rounded-3xl bg-white/5" />;
  const lic = last ? getLicense(last) : undefined;

  return (
    <section className="rounded-3xl bg-asphalt-850 p-5 ring-1 ring-white/10 sm:p-6">
      <h2 className="text-lg font-bold text-white">Cài đặt học</h2>
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Row label="Hạng bằng đang học">
            {lic ? (
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-14 items-center justify-center rounded-xl font-display text-lg text-slate-900" style={{ background: lic.color }}>
                  {lic.id}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white">{lic.name}</div>
                  <div className="truncate text-sm text-white/55">{lic.short}</div>
                </div>
                <VehicleIcon kind={lic.vehicle} className="hidden h-8 w-14 sm:block" />
                <Link href="/chon-hang" className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white ring-1 ring-white/15 hover:bg-white/15">
                  Đổi hạng
                </Link>
              </div>
            ) : (
              <Link href="/chon-hang" className="text-lane underline">
                Chọn hạng bằng
              </Link>
            )}
          </Row>
          {lic && (
            <Row
              label="Cấu trúc đề thi"
              extra={
                <Link href="/tin-tuc/de-thi-2027" className="text-xs font-semibold text-indigo-200 hover:underline">
                  Đề 2027 thay đổi gì?
                </Link>
              }
            >
              <ExamVersionSwitch license={lic.id} />
            </Row>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <Row label="Cỡ chữ">
            <div role="radiogroup" aria-label="Cỡ chữ" className="grid grid-cols-3 gap-1 rounded-2xl bg-black/30 p-1 ring-1 ring-white/10">
              {FONT_SCALES.map((f, i) => (
                <button
                  key={f}
                  type="button"
                  role="radio"
                  aria-checked={scale === f}
                  onClick={() => setScale(f)}
                  className={clsx(
                    "rounded-xl py-2 font-bold transition",
                    scale === f ? "bg-white text-slate-950" : "text-white/65 hover:bg-white/5",
                  )}
                  style={{ fontSize: `${13 + i * 2}px` }}
                >
                  {FONT_LABELS[i]}
                </button>
              ))}
            </div>
          </Row>
          <Row label="Âm thanh & rung">
            <button
              type="button"
              role="switch"
              aria-checked={sound}
              onClick={() => setSound(!sound)}
              className="flex w-full items-center justify-between rounded-2xl bg-black/30 px-4 py-2.5 ring-1 ring-white/10"
            >
              <span className="flex items-center gap-2 font-semibold text-white/80">
                {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                {sound ? "Đang bật" : "Đang tắt"}
              </span>
              <span className={clsx("relative h-6 w-11 rounded-full transition", sound ? "bg-emerald-500" : "bg-white/20")}>
                <span className={clsx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", sound ? "left-[1.375rem]" : "left-0.5")} />
              </span>
            </button>
          </Row>
          {lic && (
            <OfflineDownload license={lic.id} />
          )}
        </div>
      </div>
    </section>
  );
}

function Row({ label, extra, children }: { label: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-white/45">{label}</span>
        {extra}
      </div>
      {children}
    </div>
  );
}
