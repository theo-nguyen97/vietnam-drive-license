"use client";

import { motion } from "motion/react";
import { Bookmark, BookmarkCheck, Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import clsx from "clsx";
import type { Question } from "@/lib/types";
import { TrafficSign } from "@/components/signs/TrafficSign";
import { getSign } from "@/data/signs";
import { getChapter } from "@/data/chapters";
import { SpeakButton } from "./SpeakButton";

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
            Câu {number}
            {total > 0 && `/${total}`}
          </span>
          <span className="rounded-md bg-white/5 px-2 py-1 text-white/60">{chapter.short}</span>
          {q.critical && <span className="rounded-md bg-red-500/15 px-2 py-1 text-red-300 ring-1 ring-red-400/30">Điểm liệt</span>}
        </div>
        <div className="flex items-center gap-1">
        <SpeakButton text={`${q.text} ${q.options.map((o, i) => `Đáp án ${i + 1}: ${o}`).join(" ")}`} />
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
                  "group relative flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3 text-left text-[15px] font-medium leading-snug transition-[transform,box-shadow,background-color] duration-150 sm:text-base",
                  state === "idle" &&
                    "bg-[linear-gradient(180deg,#252b38,#1d222d)] text-white/90 ring-1 ring-inset ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.07),0_4px_0_#0b0d12] hover:-translate-y-0.5 hover:ring-lane/50 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.07),0_6px_0_#0b0d12] active:translate-y-1 active:shadow-none",
                  state === "sel" && "translate-y-0.5 bg-lane/15 text-white ring-2 ring-inset ring-lane shadow-[0_2px_0_#a87800,0_0_24px_-6px_rgba(255,210,63,.6)]",
                  state === "right" && "bg-green-500/15 text-white ring-2 ring-inset ring-green-500 shadow-[0_3px_0_#0f6b30,0_0_24px_-8px_rgba(34,197,94,.7)]",
                  state === "wrong" && "bg-red-500/15 text-white ring-2 ring-inset ring-red-500 shadow-[0_3px_0_#8f1515,0_0_24px_-8px_rgba(239,68,68,.7)]",
                  state === "dim" && "bg-asphalt-850 text-white/40 ring-1 ring-inset ring-white/5",
                  !onSelect && "cursor-default",
                )}
              >
                <span
                  className={clsx(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-hud text-base transition-colors",
                    state === "idle" && "bg-[linear-gradient(180deg,#3a4254,#2c3341)] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,.15),0_3px_0_#10131a] group-hover:bg-[linear-gradient(180deg,#ffe57a,#f5b700)] group-hover:text-slate-950 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,.6),0_3px_0_#a87800]",
                    state === "sel" && "bg-[linear-gradient(180deg,#ffe57a,#f5b700)] text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,.6),0_2px_0_#a87800]",
                    state === "right" && "bg-green-500 text-white shadow-[0_2px_0_#0f6b30]",
                    state === "wrong" && "bg-red-500 text-white shadow-[0_2px_0_#8f1515]",
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
