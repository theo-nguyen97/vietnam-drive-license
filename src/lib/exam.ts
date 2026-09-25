import type { ChapterId, LicenseId, Question } from "@/lib/types";
import { getLicense } from "@/data/licenses";
import { questionsFor } from "@/data/questions";
import { rng, shuffle } from "./random";

/** Phân bổ số câu theo chương cho từng quy mô đề. */
const PLAN: Record<number, Partial<Record<ChapterId, number>>> = {
  25: { 1: 8, 2: 1, 3: 1, 5: 8, 6: 7 },
  30: { 1: 9, 2: 1, 3: 2, 4: 1, 5: 9, 6: 8 },
  35: { 1: 10, 2: 1, 3: 2, 4: 1, 5: 11, 6: 10 },
  40: { 1: 11, 2: 2, 3: 2, 4: 2, 5: 12, 6: 11 },
  45: { 1: 13, 2: 2, 3: 2, 4: 2, 5: 13, 6: 13 },
};

/** Tạo đề thi ngẫu nhiên: luôn có ít nhất 1 câu điểm liệt. */
export function buildExam(license: LicenseId, seed: number): Question[] {
  const lic = getLicense(license)!;
  const total = lic.exam.total;
  const rand = rng(seed);
  const pool = questionsFor(license);
  const plan = PLAN[total] ?? PLAN[45];
  const picked = new Set<number>();
  const out: Question[] = [];

  const critical = shuffle(pool.filter((q) => q.critical), rand);
  if (critical[0]) {
    out.push(critical[0]);
    picked.add(critical[0].id);
  }

  for (const [chStr, count] of Object.entries(plan)) {
    const ch = Number(chStr) as ChapterId;
    let need = count! - out.filter((q) => q.chapter === ch).length;
    const candidates = shuffle(pool.filter((q) => q.chapter === ch && !q.critical && !picked.has(q.id)), rand);
    for (const q of candidates) {
      if (need <= 0) break;
      out.push(q);
      picked.add(q.id);
      need--;
    }
  }

  // Bù nếu ngân hàng chưa đủ câu ở chương nào đó.
  if (out.length < total) {
    const rest = shuffle(pool.filter((q) => !picked.has(q.id) && !q.critical), rand);
    for (const q of rest) {
      if (out.length >= total) break;
      out.push(q);
      picked.add(q.id);
    }
  }

  return out.slice(0, total).sort((a, b) => a.chapter - b.chapter || a.id - b.id);
}

export interface ExamResult {
  correct: number;
  total: number;
  passed: boolean;
  criticalFail: boolean;
  wrongIds: number[];
}

export function gradeExam(license: LicenseId, questions: Question[], answers: Record<number, number>): ExamResult {
  const lic = getLicense(license)!;
  let correct = 0;
  let criticalFail = false;
  const wrongIds: number[] = [];
  for (const q of questions) {
    const ok = answers[q.id] === q.answer;
    if (ok) correct++;
    else {
      wrongIds.push(q.id);
      if (q.critical) criticalFail = true;
    }
  }
  return {
    correct,
    total: questions.length,
    passed: !criticalFail && correct >= lic.exam.pass,
    criticalFail,
    wrongIds,
  };
}
