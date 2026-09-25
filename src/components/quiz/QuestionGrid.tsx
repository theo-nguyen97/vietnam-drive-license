"use client";

import clsx from "clsx";
import type { Question } from "@/lib/types";

export function QuestionGrid({
  questions,
  current,
  answers,
  reveal,
  onJump,
}: {
  questions: Question[];
  current: number;
  answers: Record<number, number>;
  reveal: boolean;
  onJump: (i: number) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
      {questions.map((q, i) => {
        const a = answers[q.id];
        const answered = a !== undefined;
        const ok = answered && a === q.answer;
        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onJump(i)}
            className={clsx(
              "relative flex aspect-square items-center justify-center rounded-lg font-hud text-xs font-bold transition",
              i === current && "ring-2 ring-lane ring-offset-2 ring-offset-asphalt-900",
              !reveal && answered && "bg-sky-500/80 text-white",
              !reveal && !answered && "bg-white/5 text-white/60 hover:bg-white/10",
              reveal && ok && "bg-green-500/85 text-white",
              reveal && answered && !ok && "bg-red-500/85 text-white",
              reveal && !answered && "bg-white/10 text-white/50",
            )}
            aria-label={`Câu ${i + 1}`}
          >
            {i + 1}
            {q.critical && <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-red-400" />}
          </button>
        );
      })}
    </div>
  );
}
