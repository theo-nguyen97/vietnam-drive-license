"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, ChevronDown } from "lucide-react";
import clsx from "clsx";
import type { LicenseId } from "@/lib/types";
import { LICENSES, getLicense } from "@/data/licenses";
import { useHydrated, useProgress } from "@/store/progress";
import { VehicleIcon } from "@/components/ui/VehicleIcon";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

const MAIN: { id: LicenseId; title: string; sub: string; tag?: string }[] = [
  { id: "A1", title: "Xe máy", sub: "Mô tô đến 125 cm³ — hạng A1", tag: "Phổ biến nhất" },
  { id: "B", title: "Ô tô con", sub: "Đến 8 chỗ, tải ≤ 3,5 tấn — hạng B", tag: "Phổ biến" },
  { id: "A", title: "Mô tô phân khối lớn", sub: "Trên 125 cm³ — hạng A" },
];

type Timing = "before" | "after" | "unknown";

/** Màn chào: hỏi hạng bằng và thời điểm dự thi — chỉ 2 bước. */
export function Onboarding({ mode = "welcome" }: { mode?: "welcome" | "change" }) {
  // Chờ nạp tiến độ từ localStorage: nếu không, lựa chọn hiện tại (hạng, thời điểm thi) sẽ không được điền sẵn ở chế độ "đổi hạng".
  const hydrated = useHydrated();
  if (!hydrated) return <div className="mx-auto w-full max-w-xl flex-1 px-4 pt-6 sm:pt-12" aria-busy><div className="h-80 animate-pulse rounded-3xl bg-white/5" /></div>;
  return <OnboardingForm mode={mode} />;
}

function OnboardingForm({ mode }: { mode: "welcome" | "change" }) {
  const router = useRouter();
  const current = useProgress((s) => s.lastLicense);
  const currentTiming = useProgress((s) => s.examTiming);
  const complete = useProgress((s) => s.completeOnboarding);
  const [step, setStep] = useState<1 | 2>(1);
  const [license, setLicense] = useState<LicenseId | null>(mode === "change" ? current : null);
  const [timing, setTiming] = useState<Timing>(currentTiming ?? "unknown");
  const [more, setMore] = useState(mode === "change" && !!current && !MAIN.some((m) => m.id === current));

  const lic = license ? getLicense(license)! : null;

  const finish = () => {
    if (!license) return;
    complete(license, timing);
    if (mode === "change") router.push("/");
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-10 pt-6 sm:pt-12">
      {mode === "welcome" && (
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
      )}
      <div className="mb-6 flex items-center justify-center gap-2" aria-hidden>
        {[1, 2].map((i) => (
          <span key={i} className={clsx("h-1.5 rounded-full transition-all", step === i ? "w-8 bg-lane" : "w-4 bg-white/20")} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.section key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <h1 className="text-center font-display text-3xl text-white sm:text-4xl">
              {mode === "change" ? "Đổi hạng bằng" : "Bạn định thi bằng gì?"}
            </h1>
            <p className="mt-2 text-center text-white/60">Chọn một hạng — bạn có thể đổi lại bất cứ lúc nào.</p>

            <div className="mt-6 flex flex-col gap-3" role="radiogroup" aria-label="Hạng bằng">
              {MAIN.map((m) => {
                const l = getLicense(m.id)!;
                const active = license === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setLicense(m.id)}
                    className={clsx(
                      "flex items-center gap-4 rounded-3xl p-3 pr-5 text-left ring-2 transition",
                      active ? "bg-lane/10 ring-lane" : "bg-asphalt-850 ring-white/10 hover:ring-white/25",
                    )}
                  >
                    <span className="flex h-20 w-24 shrink-0 items-end justify-center rounded-2xl bg-black/25 pb-1">
                      <VehicleIcon kind={l.vehicle} className="w-20" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-bold text-white">{m.title}</span>
                        {m.tag && <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[0.625rem] font-bold text-white/70">{m.tag}</span>}
                      </span>
                      <span className="block text-sm text-white/55">{m.sub}</span>
                    </span>
                    <span className={clsx("flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2", active ? "bg-lane text-slate-950 ring-lane" : "ring-white/20")}>
                      {active && <Check className="h-4 w-4" />}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setMore((v) => !v)}
                className="flex items-center justify-center gap-1.5 rounded-2xl py-2 text-sm font-semibold text-white/60 hover:text-white"
                aria-expanded={more}
              >
                Xe tải, xe khách & hạng khác <ChevronDown className={clsx("h-4 w-4 transition", more && "rotate-180")} />
              </button>
              {more && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {LICENSES.filter((l) => !MAIN.some((m) => m.id === l.id)).map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      role="radio"
                      aria-checked={license === l.id}
                      onClick={() => setLicense(l.id)}
                      className={clsx(
                        "rounded-2xl p-3 text-left ring-2 transition",
                        license === l.id ? "bg-lane/10 ring-lane" : "bg-asphalt-850 ring-white/10 hover:ring-white/25",
                      )}
                    >
                      <span className="font-display text-xl text-white">{l.id}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-white/55">{l.short}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button size="lg" block className="mt-6" disabled={!license} onClick={() => setStep(2)} iconRight={<ArrowRight className="h-5 w-5" />}>
              Tiếp tục
            </Button>
          </motion.section>
        ) : (
          <motion.section key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <h1 className="text-center font-display text-3xl text-white sm:text-4xl">Khi nào bạn thi?</h1>
            <p className="mt-2 text-center text-white/60">Từ 01/3/2027 đề lý thuyết có cấu trúc mới — mình sẽ chọn đúng loại đề cho bạn.</p>
            <div className="mt-6 flex flex-col gap-3" role="radiogroup" aria-label="Thời điểm thi">
              {(
                [
                  ["before", "Trước 01/3/2027", lic ? `Đề hiện hành: ${lic.exam.total} câu, đúng ${lic.exam.pass} là đạt` : ""],
                  ["after", "Từ 01/3/2027 trở đi", lic ? `Đề mới: ${lic.exam2027.total} câu, đúng ${lic.exam2027.pass} là đạt` : ""],
                  ["unknown", "Chưa biết", "Luyện đề hiện hành — đổi lúc nào cũng được"],
                ] as const
              ).map(([v, title, sub]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={timing === v}
                  onClick={() => setTiming(v)}
                  className={clsx(
                    "flex items-center gap-4 rounded-3xl p-4 text-left ring-2 transition",
                    timing === v ? "bg-lane/10 ring-lane" : "bg-asphalt-850 ring-white/10 hover:ring-white/25",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-bold text-white">{title}</span>
                    <span className="block text-sm text-white/55">{sub}</span>
                  </span>
                  <span className={clsx("flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2", timing === v ? "bg-lane text-slate-950 ring-lane" : "ring-white/20")}>
                    {timing === v && <Check className="h-4 w-4" />}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" size="lg" onClick={() => setStep(1)} icon={<ArrowLeft className="h-5 w-5" />}>
                Quay lại
              </Button>
              <Button size="lg" className="flex-1" onClick={finish} iconRight={<ArrowRight className="h-5 w-5" />}>
                {mode === "change" ? "Lưu" : "Bắt đầu học"}
              </Button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {mode === "welcome" && (
        <p className="mt-8 text-center text-sm text-white/40">
          Lần đầu đến đây?{" "}
          <Link href="/gioi-thieu" className="font-semibold text-white/70 underline-offset-4 hover:underline">
            Xem giới thiệu Lái Lụa
          </Link>
        </p>
      )}
    </div>
  );
}
