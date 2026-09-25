"use client";

import { motion } from "motion/react";
import { Bookmark, BookmarkCheck, Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import clsx from "clsx";
import type { Question } from "@/lib/types";
import { TrafficSign } from "@/components/signs/TrafficSign";
import { getSign } from "@/data/signs";
import { getChapter } from "@/data/chapters";

export function QuestionView({
  q,
  number,
  total,
  selected,
  reveal,
  onSelect,
  bookmarked,
  onBookmark,
  showExplanation = true,
}: {
  q: Question;
  number: number;
  total: number;
  selected: number | undefined;
  reveal: boolean;
  onSelect?: (i: number) => void;
  bookmarked?: boolean;
  onBookmark?: () => void;
  showExplanation?: boolean;
}) {
  const chapter = getChapter(q.chapter);
  const correct = selected === q.answer;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-md bg-white/10 px-2 py-1 font-hud text-white">
            Câu {number}/{total}
          </span>
          <span className="rounded-md bg-white/5 px-2 py-1 text-white/60">{chapter.short}</span>
          {q.critical && <span className="rounded-md bg-red-500/15 px-2 py-1 text-red-300 ring-1 ring-red-400/30">Điểm liệt</span>}
        </div>
        {onBookmark && (
          <button
            type="button"
            onClick={onBookmark}
            className={clsx("rounded-lg p-1.5 transition", bookmarked ? "text-lane" : "text-white/40 hover:text-white/80")}
            aria-label={bookmarked ? "Bỏ lưu câu hỏi" : "Lưu câu hỏi"}
            title={bookmarked ? "Bỏ lưu" : "Lưu câu này để ôn lại"}
          >
            {bookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
          </button>
        )}
      </div>

      {q.signs && q.signs.length > 0 && (
        <div className="flex flex-wrap items-end justify-center gap-4 rounded-2xl bg-white p-4 sm:gap-6">
          {q.signs.map((code, i) => (
            <figure key={code + i} className="flex flex-col items-center gap-1">
              <TrafficSign code={code} size={q.signs!.length > 3 ? 64 : 88} />
              <figcaption className="text-center text-xs font-bold text-slate-700">
                {q.signs!.length > 1 && <span className="mr-1 rounded bg-slate-900 px-1.5 py-0.5 text-white">{i + 1}</span>}
                {reveal ? <span className="font-medium text-slate-500">{getSign(code).name}</span> : <span className="font-medium text-slate-400">{code}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold leading-snug text-white sm:text-xl">{q.text}</h2>

      <ol className="flex flex-col gap-2.5">
        {q.options.map((opt, i) => {
          const isSel = selected === i;
          const isAns = q.answer === i;
          const state = reveal ? (isAns ? "right" : isSel ? "wrong" : "dim") : isSel ? "sel" : "idle";
          return (
            <li key={i}>
              <motion.button
                type="button"
                disabled={!onSelect}
                onClick={() => onSelect?.(i)}
                whileTap={onSelect ? { scale: 0.98 } : undefined}
                animate={state === "wrong" ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className={clsx(
                  "group flex w-full items-start gap-3 rounded-xl px-3.5 py-3 text-left text-[15px] leading-snug ring-1 transition sm:text-base",
                  state === "idle" && "bg-asphalt-800 text-white/90 ring-white/10 hover:bg-asphalt-700 hover:ring-lane/50",
                  state === "sel" && "bg-lane/15 text-white ring-2 ring-lane",
                  state === "right" && "bg-green-500/15 text-white ring-2 ring-green-500",
                  state === "wrong" && "bg-red-500/15 text-white ring-2 ring-red-500",
                  state === "dim" && "bg-asphalt-850 text-white/45 ring-white/5",
                  !onSelect && "cursor-default",
                )}
              >
                <span
                  className={clsx(
                    "mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-hud text-sm font-bold",
                    state === "idle" && "bg-white/10 text-white/70 group-hover:bg-lane group-hover:text-slate-900",
                    state === "sel" && "bg-lane text-slate-900",
                    state === "right" && "bg-green-500 text-white",
                    state === "wrong" && "bg-red-500 text-white",
                    state === "dim" && "bg-white/5 text-white/30",
                  )}
                >
                  {state === "right" ? "✓" : state === "wrong" ? "✕" : i + 1}
                </span>
                <span className="flex-1">{opt}</span>
              </motion.button>
            </li>
          );
        })}
      </ol>

      {reveal && showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            "rounded-2xl p-4 ring-1",
            selected === undefined ? "bg-white/5 ring-white/10" : correct ? "bg-green-500/10 ring-green-500/30" : "bg-red-500/10 ring-red-500/30",
          )}
        >
          <div className="mb-1.5 flex items-center gap-2 font-bold">
            {selected === undefined ? (
              <span className="text-white/80">Chưa trả lời — đáp án đúng: {q.answer + 1}</span>
            ) : correct ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-400" /> <span className="text-green-300">Chính xác!</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-400" /> <span className="text-red-300">Chưa đúng — đáp án đúng là {q.answer + 1}</span>
              </>
            )}
          </div>
          <p className="text-[15px] leading-relaxed text-white/85">{q.explanation}</p>
          {q.tip && (
            <p className="mt-3 flex gap-2 rounded-xl bg-amber-400/10 p-3 text-sm text-amber-200 ring-1 ring-amber-400/20">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <b>Mẹo nhớ:</b> {q.tip}
              </span>
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
