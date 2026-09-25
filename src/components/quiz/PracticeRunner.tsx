"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ChevronLeft, Grid3x3, Flame, Trophy, RotateCcw } from "lucide-react";
import clsx from "clsx";
import type { LicenseId, Question } from "@/lib/types";
import { getLicense } from "@/data/licenses";
import { useHydrated, useProgress } from "@/store/progress";
import { buildSet, setMeta } from "@/lib/sets";
import { sfx } from "@/lib/sound";
import { SceneStage, type Outcome } from "./SceneStage";
import { QuestionView } from "./QuestionView";
import { QuestionGrid } from "./QuestionGrid";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { Button, ButtonLink, iconButtonClass } from "@/components/ui/Button";

export function PracticeRunner({ license, set }: { license: LicenseId; set: string }) {
  const hydrated = useHydrated();
  const [round, setRound] = useState(0);
  if (!hydrated) return <LoadingGarage />;
  return <PracticeSession key={`${set}-${round}`} license={license} set={set} onRestart={() => setRound((r) => r + 1)} />;
}

function LoadingGarage() {
  return (
    <div className="flex flex-1 items-center justify-center p-10 text-white/60">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
        <span className="h-3 w-3 animate-pulse rounded-full bg-amber-400 [animation-delay:.2s]" />
        <span className="h-3 w-3 animate-pulse rounded-full bg-green-500 [animation-delay:.4s]" />
        <span className="ml-2 text-sm">Đang nổ máy…</span>
      </div>
    </div>
  );
}

function PracticeSession({ license, set, onRestart }: { license: LicenseId; set: string; onRestart: () => void }) {
  const lic = getLicense(license)!;
  const meta = setMeta(set);
  const [questions] = useState<Question[]>(() => {
    const s = useProgress.getState();
    return buildSet(license, set, s.stats, s.bookmarks);
  });
  const record = useProgress((s) => s.record);
  const addXp = useProgress((s) => s.addXp);
  const setBestCombo = useProgress((s) => s.setBestCombo);
  const bookmarks = useProgress((s) => s.bookmarks);
  const toggleBookmark = useProgress((s) => s.toggleBookmark);
  const setLastLicense = useProgress((s) => s.setLastLicense);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [gains, setGains] = useState<Record<number, number>>({});
  const [combo, setCombo] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setLastLicense(license);
  }, [license, setLastLicense]);

  const q = questions[idx];
  const selected = q ? answers[q.id] : undefined;
  const answered = selected !== undefined;
  const outcome: Outcome = answered ? (selected === q.answer ? "correct" : "wrong") : null;
  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter((x) => answers[x.id] === x.answer).length;
  const sessionXp = Object.values(gains).reduce((a, b) => a + b, 0);

  const choose = useCallback(
    (i: number) => {
      if (!q || answers[q.id] !== undefined || i >= q.options.length) return;
      const ok = i === q.answer;
      setAnswers((a) => ({ ...a, [q.id]: i }));
      record(q.id, ok);
      if (ok) {
        const nextCombo = combo + 1;
        const gain = 10 + Math.min(combo, 5) * 2 + (q.critical ? 5 : 0);
        setCombo(nextCombo);
        setBestCombo(nextCombo);
        setGains((g) => ({ ...g, [q.id]: gain }));
        addXp(gain);
        sfx.correct();
      } else {
        setCombo(0);
        sfx.wrong();
      }
    },
    [q, answers, combo, record, addXp, setBestCombo],
  );

  const next = useCallback(() => {
    if (idx < questions.length - 1) setIdx(idx + 1);
    else setDone(true);
  }, [idx, questions.length]);

  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key >= "1" && e.key <= "9") choose(Number(e.key) - 1);
      else if ((e.key === "Enter" || e.key === "ArrowRight") && answered) {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, next, prev, answered, done]);

  const backHref = `/hang/${license.toLowerCase()}`;

  if (questions.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-6xl">{set === "cau-sai" ? "🏁" : "🔖"}</div>
        <h1 className="font-display text-2xl text-white">{set === "cau-sai" ? "Không còn câu sai!" : "Chưa có câu nào"}</h1>
        <p className="text-white/60">
          {set === "cau-sai"
            ? "Bạn chưa có câu nào trả lời sai ở lần gần nhất. Hãy ôn thêm các chương hoặc thi thử."
            : "Bấm biểu tượng dấu trang trên câu hỏi để lưu lại những câu cần ôn."}
        </p>
        <ButtonLink href={backHref}>Về bản đồ hạng {lic.id}</ButtonLink>
      </div>
    );
  }

  if (done) {
    const wrong = questions.filter((x) => answers[x.id] !== undefined && answers[x.id] !== x.answer);
    const pct = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;
    return (
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="overflow-hidden rounded-3xl bg-asphalt-850 ring-1 ring-white/10">
          <div className="hazard-stripes h-3" />
          <div className="p-6 text-center sm:p-8">
            <div className="text-6xl">🏁</div>
            <h1 className="mt-2 font-display text-3xl text-white">Về đích!</h1>
            <p className="mt-1 text-white/60">
              {meta.icon} {meta.title} · Hạng {lic.id}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat label="Chính xác" value={`${pct}%`} tone="text-green-400" />
              <Stat label="Đúng / Đã làm" value={`${correctCount}/${answeredCount}`} tone="text-white" />
              <Stat label="XP nhận được" value={`+${sessionXp}`} tone="text-lane" />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {wrong.length > 0 && (
                <ButtonLink href={`${backHref}/on-tap/cau-sai`} variant="danger" icon={<RotateCcw className="h-4 w-4" />}>
                  Ôn lại {wrong.length} câu sai
                </ButtonLink>
              )}
              <Button variant="secondary" onClick={onRestart}>
                Chạy lại chặng này
              </Button>
              <ButtonLink href={`${backHref}/bo-de`} icon={<Trophy className="h-4 w-4" />}>
                Bộ đề 2026
              </ButtonLink>
            </div>
          </div>
        </motion.div>
        <div className="mt-4 text-center">
          <Link href={backHref} className="text-sm text-white/60 underline-offset-4 hover:underline">
            ← Về bản đồ hạng {lic.id}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* HUD */}
      <div className="sticky top-0 z-30 border-b border-white/5 bg-asphalt-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 sm:px-4">
          <Link href={backHref} className={iconButtonClass()} aria-label="Quay lại">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-md px-1.5 py-0.5 font-display text-xs text-slate-900" style={{ background: lic.color }}>
                {lic.id}
              </span>
              <span className="truncate font-semibold text-white">
                {meta.icon} {meta.title}
              </span>
            </div>
            <FuelBar value={answeredCount / questions.length} />
          </div>
          <AnimatePresence>
            {combo >= 2 && (
              <motion.div
                key={combo}
                initial={{ scale: 1.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 rounded-xl bg-orange-500/20 px-2 py-1.5 font-hud text-sm font-bold text-orange-300 ring-1 ring-orange-400/40"
                title="Chuỗi trả lời đúng"
              >
                <Flame className="h-4 w-4" />x{combo}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="hidden rounded-xl bg-lane/15 px-2.5 py-1.5 font-hud text-sm font-bold text-lane ring-1 ring-lane/30 sm:block">+{sessionXp} XP</div>
          <SoundToggle />
          <button
            type="button"
            onClick={() => setShowGrid((v) => !v)}
            className={iconButtonClass(showGrid)}
            aria-label="Danh sách câu hỏi"
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
        </div>
        <AnimatePresence>
          {showGrid && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/5">
              <div className="mx-auto max-h-64 max-w-6xl overflow-y-auto px-4 py-3 thin-scroll">
                <QuestionGrid
                  questions={questions}
                  current={idx}
                  answers={answers}
                  reveal
                  onJump={(i) => {
                    setIdx(i);
                    setShowGrid(false);
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-5 px-3 py-4 sm:px-4 lg:grid-cols-[1.25fr_1fr] lg:py-6">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SceneStage q={q} number={idx + 1} vehicle={lic.vehicle} outcome={outcome} mode="practice" xpGain={gains[q.id]} />
          <p className="mt-2 hidden text-center text-xs text-white/40 lg:block">Phím tắt: 1–4 chọn đáp án · Enter sang câu tiếp · ← câu trước</p>
        </div>
        <div className="flex flex-col gap-4 pb-24 lg:pb-0">
          <QuestionView
            q={q}
            number={idx + 1}
            total={questions.length}
            selected={selected}
            reveal={answered}
            onSelect={answered ? undefined : choose}
            bookmarked={bookmarks.includes(q.id)}
            onBookmark={() => toggleBookmark(q.id)}
          />
        </div>
      </div>

      {/* Thanh điều hướng */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-asphalt-950/90 backdrop-blur lg:static lg:border-0 lg:bg-transparent">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-4 lg:justify-end lg:pb-8">
          <Button variant="secondary" onClick={prev} disabled={idx === 0} icon={<ArrowLeft className="h-4 w-4" />}>
            Trước
          </Button>
          <Button
            variant={answered ? "primary" : "secondary"}
            onClick={answered ? next : () => setIdx((i) => Math.min(questions.length - 1, i + 1))}
            className="flex-1 sm:flex-none sm:min-w-44"
            iconRight={<ArrowRight className="h-4 w-4" />}
          >
            {answered ? (idx === questions.length - 1 ? "Về đích 🏁" : "Tiếp tục") : "Bỏ qua"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FuelBar({ value }: { value: number }) {
  return (
    <div className="mt-1 flex items-center gap-2">
      <span className="text-[10px] font-bold text-white/40">⛽</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-green-500" animate={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
      <div className={clsx("font-hud text-2xl font-bold", tone)}>{value}</div>
      <div className="text-xs text-white/50">{label}</div>
    </div>
  );
}

