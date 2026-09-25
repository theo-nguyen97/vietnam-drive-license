"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Play, RotateCcw } from "lucide-react";
import type { PlayerVehicle, Question } from "@/lib/types";
import { DriveScene } from "@/components/scene/DriveScene";
import { JunctionScene } from "@/components/scene/JunctionScene";
import { getChapter } from "@/data/chapters";
import { hash } from "@/lib/random";
import { buttonClass } from "@/components/ui/Button";

export type Outcome = null | "correct" | "wrong";

export function SceneStage({
  q,
  number,
  vehicle,
  outcome,
  mode,
  xpGain,
}: {
  q: Question;
  number: number;
  vehicle: PlayerVehicle;
  outcome: Outcome;
  mode: "practice" | "exam" | "review";
  xpGain?: number;
}) {
  const [replay, setReplay] = useState(0);
  const [played, setPlayed] = useState<number | null>(null);
  const chapter = getChapter(q.chapter);
  const scene = q.scene;
  const junction = scene?.kind === "junction" ? scene : null;

  const onReplay = useCallback(() => {
    setReplay((r) => r + 1);
    setPlayed(q.id);
  }, [q.id]);

  // Sa hình: tự chạy mô phỏng khi đã trả lời ở chế độ ôn tập; ở chế độ xem lại thì bấm để chạy.
  const jPlaying = junction && ((mode === "practice" && outcome) || played === q.id);
  const jPhase = jPlaying ? "play" : outcome ? "idle" : "intro";

  const drivePhase = mode === "review" ? "idle" : outcome === "correct" ? "pass" : outcome === "wrong" ? "fail" : "intro";
  const props = scene?.kind === "road" ? scene.props : q.chapter === 4 ? (["garage"] as const) : undefined;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 shadow-2xl ring-1 ring-white/10">
      {junction ? (
        <JunctionScene spec={junction} phase={jPhase} runKey={`${q.id}-${replay}`} />
      ) : (
        <DriveScene
          vehicle={vehicle}
          props={props ? [...props] : undefined}
          signs={q.signs}
          phase={drivePhase}
          runKey={q.id}
          label={`CÂU ${number}`}
          seed={hash(q.id)}
        />
      )}

      {/* HUD góc trên */}
      <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap items-center gap-1.5 sm:left-3 sm:top-3">
        <span className="rounded-lg bg-slate-950/80 px-2 py-1 font-hud text-xs font-bold tracking-wider text-lane ring-1 ring-white/10">
          TRẠM {number}
        </span>
        <span className="hidden rounded-lg bg-slate-950/70 px-2 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/10 sm:inline">
          {chapter.icon} {chapter.short}
        </span>
      </div>
      {q.critical && (
        <div className="pointer-events-none absolute right-2 top-2 sm:right-3 sm:top-3">
          <span className="rounded-lg bg-red-600 px-2 py-1 text-xs font-extrabold tracking-wide text-white shadow ring-1 ring-red-300/40">
            ⚠ ĐIỂM LIỆT
          </span>
        </div>
      )}

      {/* Kết quả */}
      {mode === "practice" && outcome && <OutcomeBadge key={`${q.id}-${outcome}`} outcome={outcome} xpGain={xpGain} />}

      {junction && outcome && (
        <button
          type="button"
          onClick={onReplay}
          className={buttonClass({ size: "sm", className: "absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3" })}
        >
          {jPlaying ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {jPlaying ? "Xem lại" : "Xem mô phỏng"}
        </button>
      )}
    </div>
  );
}

function OutcomeBadge({ outcome, xpGain }: { outcome: "correct" | "wrong"; xpGain?: number }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1900);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0.4, opacity: 0, y: -10 }}
          animate={outcome === "wrong" ? { scale: 1, opacity: 1, y: 0, rotate: [0, -4, 4, -2, 0] } : { scale: 1, opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="pointer-events-none absolute inset-x-0 top-[18%] flex justify-center"
        >
          {outcome === "correct" ? (
            <div className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-2.5 font-display text-lg text-white shadow-[0_8px_30px_rgba(34,197,94,.5)] sm:text-2xl">
              ✓ QUA TRẠM!
              {xpGain ? <span className="rounded-lg bg-white/25 px-2 py-0.5 font-hud text-base sm:text-lg">+{xpGain} XP</span> : null}
            </div>
          ) : (
            <div className="rounded-2xl border-4 border-white bg-red-600 px-5 py-2 font-display text-lg text-white shadow-[0_8px_30px_rgba(239,68,68,.5)] sm:text-2xl">
              ✕ VI PHẠM!
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
