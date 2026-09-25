import type { ChapterId, LicenseId } from "@/lib/types";
import { questionsFor } from "@/data/questions";
import type { ExamRecord, QStat } from "@/store/progress";

export function licenseProgress(license: LicenseId, stats: Record<number, QStat>, exams: ExamRecord[]) {
  const qs = questionsFor(license);
  let mastered = 0;
  let seen = 0;
  let wrong = 0;
  const chapters: Partial<Record<ChapterId, { total: number; mastered: number; seen: number }>> = {};
  for (const q of qs) {
    const s = stats[q.id];
    const ch = (chapters[q.chapter] ??= { total: 0, mastered: 0, seen: 0 });
    ch.total++;
    if (s) {
      seen++;
      ch.seen++;
      if (s.last === 1) {
        mastered++;
        ch.mastered++;
      } else wrong++;
    }
  }
  const mine = exams.filter((e) => e.license === license);
  const passed = mine.filter((e) => e.passed).length;
  const best = mine.reduce((m, e) => Math.max(m, e.correct / e.total), 0);
  const critical = qs.filter((q) => q.critical);
  const criticalMastered = critical.filter((q) => stats[q.id]?.last === 1).length;
  return {
    total: qs.length,
    mastered,
    seen,
    wrong,
    pct: qs.length ? mastered / qs.length : 0,
    chapters,
    exams: mine.length,
    passed,
    best,
    critical: critical.length,
    criticalMastered,
  };
}
