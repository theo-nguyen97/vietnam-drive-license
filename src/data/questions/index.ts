import type { ChapterId, LicenseId, Question, VehicleGroup } from "@/lib/types";
import { getLicense } from "@/data/licenses";
import { CHAPTERS } from "@/data/chapters";
import { CH1 } from "./ch1";
import { CH1B } from "./ch1b";
import { EXTRA } from "./extra";
import { LAW2027 } from "./law2027";
import { CH2 } from "./ch2";
import { CH3 } from "./ch3";
import { CH4 } from "./ch4";
import { CH5 } from "./ch5";
import { CH6 } from "./ch6";
import { CH1C } from "./ch1c";
import { CH234 } from "./ch234";
import { CH5B } from "./ch5b";
import { CH6B } from "./ch6b";

export const QUESTIONS: Question[] = [...CH1, ...CH1B, ...CH2, ...CH3, ...CH4, ...CH5, ...CH6, ...EXTRA, ...LAW2027, ...CH1C, ...CH234, ...CH5B, ...CH6B].sort(
  (a, b) => a.chapter - b.chapter || a.id - b.id,
);

const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

export function getQuestion(id: number) {
  return BY_ID.get(id);
}

function appliesTo(q: Question, group: VehicleGroup) {
  if (q.only && q.only !== group) return false;
  const ch = CHAPTERS.find((c) => c.id === q.chapter)!;
  return ch.groups.includes(group);
}

/** Danh sách câu hỏi áp dụng cho một hạng bằng. */
export function questionsFor(license: LicenseId): Question[] {
  const group = getLicense(license)!.group;
  return QUESTIONS.filter((q) => appliesTo(q, group));
}

export function questionsForChapter(license: LicenseId, chapter: ChapterId) {
  return questionsFor(license).filter((q) => q.chapter === chapter);
}
