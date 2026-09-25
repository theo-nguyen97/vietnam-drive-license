import type { ChapterId, LicenseId, Question } from "@/lib/types";
import { getLicense } from "@/data/licenses";
import { questionsFor } from "@/data/questions";
import { hash, rng, shuffle } from "./random";

/**
 * Cấu trúc đề sát hạch lý thuyết áp dụng năm 2026
 * (Thông tư 12/2025/TT-BCA, bộ câu hỏi áp dụng từ 01/6/2025).
 * Mỗi đề có đúng 01 câu "tình huống mất an toàn giao thông nghiêm trọng" (điểm liệt),
 * tính riêng ngoài số câu của chương 1.
 *
 * - A1, A, B1 (25 câu): 8 quy định chung · 1 điểm liệt · 1 văn hoá · 1 kỹ thuật · 8 báo hiệu · 6 sa hình
 * - B  (30 câu): 8 · 1 · 1 · 1 kỹ thuật · 1 cấu tạo · 9 báo hiệu · 9 sa hình
 * - C1 (35 câu): 10 · 1 · 1 · 2 · 1 · 10 · 10
 * - C  (40 câu): 10 · 1 · 1 · 2 · 1 · 14 · 11
 * - D1, D2, D, BE, C1E, CE, D1E, D2E, DE (45 câu): 10 · 1 · 1 · 2 · 1 · 16 · 14
 */
export const EXAM_PLAN: Record<number, Partial<Record<ChapterId, number>>> = {
  25: { 1: 8, 2: 1, 3: 1, 5: 8, 6: 6 },
  30: { 1: 8, 2: 1, 3: 1, 4: 1, 5: 9, 6: 9 },
  35: { 1: 10, 2: 1, 3: 2, 4: 1, 5: 10, 6: 10 },
  40: { 1: 10, 2: 1, 3: 2, 4: 1, 5: 14, 6: 11 },
  45: { 1: 10, 2: 1, 3: 2, 4: 1, 5: 16, 6: 14 },
};

/** Thứ tự hiển thị trong đề: chương 1 → câu điểm liệt → các chương còn lại. */
function orderExam(qs: Question[]) {
  const rank = (q: Question) => (q.critical ? 1.5 : q.chapter);
  return qs.slice().sort((a, b) => rank(a) - rank(b) || a.id - b.id);
}

/** Lấy lần lượt từ một hàng đợi vòng tròn — giúp các đề phủ đều ngân hàng câu hỏi. */
class Cycle<T extends { id: number }> {
  private i = 0;
  private items: T[];
  constructor(items: T[]) {
    this.items = items;
  }
  take(n: number, used: Set<number>): T[] {
    const out: T[] = [];
    if (!this.items.length) return out;
    let guard = 0;
    while (out.length < n && guard < this.items.length * 2) {
      const it = this.items[this.i % this.items.length];
      this.i++;
      guard++;
      if (!used.has(it.id)) {
        out.push(it);
        used.add(it.id);
      }
    }
    return out;
  }
}

function compose(license: LicenseId, pick: (ch: ChapterId | "critical", n: number, used: Set<number>) => Question[]) {
  const lic = getLicense(license)!;
  const total = lic.exam.total;
  const plan = EXAM_PLAN[total] ?? EXAM_PLAN[45];
  const used = new Set<number>();
  const out: Question[] = [...pick("critical", 1, used)];
  for (const [ch, n] of Object.entries(plan)) out.push(...pick(Number(ch) as ChapterId, n!, used));
  // Bù (nếu một chương nào đó chưa đủ câu) bằng câu thường ở chương 1, 5, 6.
  for (const ch of [1, 5, 6] as ChapterId[]) {
    if (out.length >= total) break;
    out.push(...pick(ch, total - out.length, used));
  }
  return orderExam(out.slice(0, total));
}

/** Tạo đề ngẫu nhiên (thi thử nhanh). */
export function buildExam(license: LicenseId, seed: number): Question[] {
  const rand = rng(seed);
  const pool = questionsFor(license);
  return compose(license, (ch, n, used) => {
    const src = ch === "critical" ? pool.filter((q) => q.critical) : pool.filter((q) => q.chapter === ch && !q.critical);
    return shuffle(src, rand)
      .filter((q) => !used.has(q.id))
      .slice(0, n)
      .map((q) => (used.add(q.id), q));
  });
}

/** Số đề trong bộ đề của mỗi hạng. */
export function setCount(license: LicenseId) {
  return getLicense(license)!.group === "moto" ? 10 : 20;
}

const SET_CACHE = new Map<LicenseId, Question[][]>();

/**
 * Bộ đề cố định của từng hạng (Đề số 1…N). Sinh tất định từ mã hạng nên mọi
 * người dùng đều có cùng bộ đề; các câu được xoay vòng để phủ đều ngân hàng câu hỏi
 * và mỗi đề có một câu điểm liệt khác nhau (khi đủ câu).
 */
export function examSets(license: LicenseId): Question[][] {
  const cached = SET_CACHE.get(license);
  if (cached) return cached;
  const rand = rng(hash(license.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 7)));
  const pool = questionsFor(license);
  const cycles = new Map<ChapterId | "critical", Cycle<Question>>();
  cycles.set("critical", new Cycle(shuffle(pool.filter((q) => q.critical), rand)));
  for (const ch of [1, 2, 3, 4, 5, 6] as ChapterId[]) {
    cycles.set(ch, new Cycle(shuffle(pool.filter((q) => q.chapter === ch && !q.critical), rand)));
  }
  const sets = Array.from({ length: setCount(license) }, () => compose(license, (ch, n, used) => cycles.get(ch)!.take(n, used)));
  SET_CACHE.set(license, sets);
  return sets;
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
