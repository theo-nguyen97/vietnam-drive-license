"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Play, RotateCcw, FlaskConical } from "lucide-react";
import clsx from "clsx";
import type { Consequence, PlayerVehicle, Question } from "@/lib/types";
import { DriveScene } from "@/components/scene/DriveScene";
import { JunctionScene } from "@/components/scene/JunctionScene";
import { getChapter } from "@/data/chapters";
import { hash } from "@/lib/random";
import { whatIf } from "@/lib/whatif";
import { buttonClass } from "@/components/ui/Button";

export type Outcome = null | "correct" | "wrong";

const KIND_UI = {
  crash: { icon: "💥", label: "Va chạm", tone: "bg-red-500/10 ring-red-400/40 text-red-100" },
  ticket: { icon: "🚨", label: "Bị xử phạt", tone: "bg-orange-500/10 ring-orange-400/40 text-orange-100" },
  danger: { icon: "⚠️", label: "Mất an toàn", tone: "bg-amber-400/10 ring-amber-400/40 text-amber-100" },
  ok: { icon: "✅", label: "An toàn", tone: "bg-green-500/10 ring-green-400/40 text-green-100" },
} as const;

/** Hậu quả của việc chọn đáp án `i` cho câu không có sa hình (hoặc có sa hình nhưng không suy ra được). */
function roadConsequence(q: Question, i: number): Consequence | null {
  const explicit = q.consequences?.[i];
  if (explicit) return explicit;
  if (i === q.answer) return q.scene || q.consequences ? { kind: "ok", text: "Xử lý đúng quy tắc — barie mở, bạn qua trạm an toàn." } : null;
  if (q.scene || q.consequences) return { kind: "danger", text: "Cách xử lý này không đúng quy tắc giao thông — xem giải thích bên dưới để hiểu vì sao." };
  return null;
}

export function SceneStage({
  q,
  number,
  vehicle,
  outcome,
  mode,
  xpGain,
  selected,
}: {
  q: Question;
  number: number;
  vehicle: PlayerVehicle;
  outcome: Outcome;
  mode: "practice" | "exam" | "review";
  xpGain?: number;
  /** Đáp án người học đã chọn (để mô phỏng "nếu làm vậy thì sao"). */
  selected?: number;
}) {
  const [replay, setReplay] = useState(0);
  const [played, setPlayed] = useState<number | null>(null);
  /** Đáp án đang được mô phỏng do người học chọn thử (gắn với câu + đáp án đã trả lời để tự về mặc định khi đổi câu). */
  const [override, setOverride] = useState<{ key: string; choice: number } | null>(null);
  const chapter = getChapter(q.chapter);
  const scene = q.scene;
  const junction = scene?.kind === "junction" ? scene : null;
  const simKey = `${q.id}-${selected ?? "x"}`;
  const sim = override?.key === simKey ? override.choice : selected ?? null;
  const plan = useMemo(() => (junction && sim !== null ? whatIf(q, sim) : null), [junction, q, sim]);
  const consequence = useMemo(() => (sim === null ? null : plan ? plan.verdict : roadConsequence(q, sim)), [plan, q, sim]);

  const simulate = useCallback(
    (i: number) => {
      setOverride({ key: simKey, choice: i });
      setReplay((r) => r + 1);
      setPlayed(q.id);
    },
    [q.id, simKey],
  );

  const onReplay = useCallback(() => {
    setReplay((r) => r + 1);
    setPlayed(q.id);
  }, [q.id]);

  // Sa hình: tự chạy mô phỏng khi đã trả lời ở chế độ ôn tập; ở chế độ xem lại thì bấm để chạy.
  const jPlaying = junction && ((mode === "practice" && outcome) || played === q.id);
  const jPhase = jPlaying ? "play" : outcome ? "idle" : "intro";

  const simOutcome: Outcome = sim === null ? null : sim === q.answer ? "correct" : "wrong";
  const driveActive = mode === "practice" ? outcome : played === q.id ? simOutcome : null;
  const drivePhase = driveActive === "correct" ? "pass" : driveActive === "wrong" ? "fail" : mode === "review" ? "idle" : "intro";
  const driveKind = driveActive === "wrong" && sim !== null ? roadConsequence(q, sim)?.kind : undefined;
  const props = scene?.kind === "road" ? scene.props : q.chapter === 4 ? (["garage"] as const) : undefined;

  const canSimulate = !!outcome && (mode === "practice" || mode === "review") && !!(q.scene || q.consequences);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 shadow-2xl ring-1 ring-white/10">
        {junction ? (
          <JunctionScene spec={junction} phase={jPhase} runKey={`${q.id}-${sim}-${replay}`} plan={jPlaying ? plan : null} />
        ) : (
          <DriveScene
            vehicle={vehicle}
            props={props ? [...props] : undefined}
            signs={q.signs}
            phase={drivePhase}
            runKey={`${q.id}-${sim}-${replay}`}
            label={`CÂU ${number}`}
            seed={hash(q.id)}
            consequence={driveKind}
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
          {canSimulate && sim !== null && (jPlaying || played === q.id || mode === "practice") && (
            <span className="rounded-lg bg-slate-950/80 px-2 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/10">
              {sim === q.answer ? "▶ Cách đi đúng" : `▶ Nếu chọn đáp án ${sim + 1}`}
            </span>
          )}
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

        {(junction || mode === "review") && outcome && (
          <button
            type="button"
            onClick={onReplay}
            className={buttonClass({ size: "sm", className: "absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3" })}
          >
            {jPlaying || played === q.id ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {jPlaying || played === q.id ? "Xem lại" : "Xem mô phỏng"}
          </button>
        )}
      </div>

      {/* Thử các cách xử lý khác + hậu quả */}
      {canSimulate && (
        <div className="rounded-2xl bg-asphalt-850 p-3 ring-1 ring-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-white/60">
              <FlaskConical className="h-3.5 w-3.5" /> Thử cách xử lý khác
            </span>
            <div className="flex flex-wrap gap-1.5">
              {q.options.map((_, i) => {
                const isAns = i === q.answer;
                const active = sim === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => simulate(i)}
                    className={clsx(
                      "rounded-lg px-2.5 py-1 font-hud text-sm font-bold ring-1 transition",
                      active
                        ? isAns
                          ? "bg-green-500 text-white ring-green-300"
                          : "bg-red-500 text-white ring-red-300"
                        : isAns
                          ? "bg-green-500/15 text-green-200 ring-green-400/40 hover:bg-green-500/30"
                          : "bg-white/5 text-white/80 ring-white/15 hover:bg-white/10",
                    )}
                    aria-pressed={active}
                    title={isAns ? "Cách xử lý đúng" : `Mô phỏng nếu chọn đáp án ${i + 1}`}
                  >
                    {isAns ? `✓ ${i + 1}` : i + 1}
                  </button>
                );
              })}
            </div>
          </div>
          <AnimatePresence mode="wait">
            {consequence && sim !== null && (
              <motion.div
                key={`${q.id}-${sim}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={clsx("mt-2.5 flex gap-2.5 rounded-xl p-3 text-sm leading-relaxed ring-1", KIND_UI[consequence.kind].tone)}
              >
                <span className="text-xl leading-none">{KIND_UI[consequence.kind].icon}</span>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide opacity-80">
                    {sim === q.answer ? "Cách đi đúng" : `Nếu chọn đáp án ${sim + 1}`} · {KIND_UI[consequence.kind].label}
                  </div>
                  <p className="mt-0.5">{consequence.text}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
