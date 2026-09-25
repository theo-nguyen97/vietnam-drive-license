import type { ExamVersion, LicenseId, Question } from "@/lib/types";
import { examConfig, getLicense } from "@/data/licenses";
import { questionsFor } from "@/data/questions";
import type { ExamRecord, QStat } from "@/store/progress";
import { buildExam } from "./exam";
import { analyze, getTopic, topicOf } from "./topics";

export interface Prediction {
  /** xác suất đậu (0..1) */
  p: number;
  /** độ tin cậy dựa trên độ phủ câu hỏi */
  confidence: "low" | "medium" | "high";
  label: string;
  tone: "red" | "amber" | "green";
  reasons: { icon: string; text: string; good: boolean }[];
}

/** Xác suất trả lời đúng một câu, ước lượng từ lịch sử. */
function probCorrect(q: Question, s: QStat | undefined, topicAcc: Map<string, number>) {
  if (!s) {
    const acc = topicAcc.get(topicOf(q));
    return acc === undefined ? 0.42 : 0.25 + 0.5 * acc;
  }
  if (s.last === 1) return Math.min(0.97, 0.8 + 0.035 * (s.box ?? 1) - 0.04 * Math.min(s.w, 2));
  return Math.min(0.55, 0.3 + 0.06 * Math.min(s.c, 3));
}

/** P(số câu đúng ≥ k) với các câu độc lập (phân phối Poisson-nhị thức). */
function atLeast(ps: number[], k: number) {
  let dist = [1];
  for (const p of ps) {
    const next = new Array(dist.length + 1).fill(0);
    for (let i = 0; i < dist.length; i++) {
      next[i] += dist[i] * (1 - p);
      next[i + 1] += dist[i] * p;
    }
    dist = next;
  }
  let sum = 0;
  for (let i = Math.max(0, k); i < dist.length; i++) sum += dist[i];
  return sum;
}

export function predictPass(
  license: LicenseId,
  version: ExamVersion,
  stats: Record<number, QStat>,
  exams: ExamRecord[],
  samples = 160,
): Prediction {
  const lic = getLicense(license)!;
  const cfg = examConfig(lic, version);
  const pool = questionsFor(license);
  const reports = analyze(license, stats);
  const topicAcc = new Map<string, number>();
  for (const r of reports) if (r.accuracy !== null && r.attempts >= 2) topicAcc.set(r.topic.id, r.accuracy);

  let total = 0;
  for (let i = 0; i < samples; i++) {
    const exam = buildExam(license, 1000 + i * 7919, version);
    const crit = exam.find((q) => q.critical);
    const rest = exam.filter((q) => q !== crit).map((q) => probCorrect(q, stats[q.id], topicAcc));
    const pc = crit ? probCorrect(crit, stats[crit.id], topicAcc) : 1;
    total += pc * atLeast(rest, cfg.pass - (crit ? 1 : 0));
  }
  let p = total / samples;

  const recent = exams.filter((e) => e.license === license && (e.version ?? "tt12") === version).slice(0, 5);
  if (recent.length >= 2) {
    const rate = recent.filter((e) => e.passed).length / recent.length;
    p = 0.7 * p + 0.3 * rate;
  }

  const seen = pool.filter((q) => stats[q.id]).length;
  const coverage = seen / pool.length;
  const confidence = coverage < 0.3 ? "low" : coverage < 0.7 ? "medium" : "high";

  const critical = pool.filter((q) => q.critical);
  const critOk = critical.filter((q) => stats[q.id]?.last === 1).length;
  const weak = reports.find((r) => r.status === "danger");

  const reasons: Prediction["reasons"] = [];
  const unseen = pool.length - seen;
  reasons.push(
    unseen > 0
      ? { icon: "📚", text: `Còn ${unseen}/${pool.length} câu chưa học`, good: unseen < pool.length * 0.1 }
      : { icon: "📚", text: "Đã học hết ngân hàng câu hỏi", good: true },
  );
  reasons.push({ icon: "⚠️", text: `Điểm liệt đã thuộc ${critOk}/${critical.length} câu`, good: critOk === critical.length });
  if (weak) {
    const t = getTopic(weak.topic.id)!;
    reasons.push({ icon: t.icon, text: `Hay sai: ${t.name} (đúng ${Math.round((weak.accuracy ?? 0) * 100)}%)`, good: false });
  }
  if (recent.length) {
    const ok = recent.filter((e) => e.passed).length;
    reasons.push({ icon: "🏁", text: `Thi thử gần đây: đạt ${ok}/${recent.length} lần`, good: ok / recent.length >= 0.8 });
  }

  const tone = p >= 0.8 ? "green" : p >= 0.5 ? "amber" : "red";
  const label = p >= 0.9 ? "Sẵn sàng đi thi" : p >= 0.8 ? "Khả năng cao" : p >= 0.5 ? "Cần luyện thêm" : p >= 0.2 ? "Chưa sẵn sàng" : "Mới bắt đầu";
  return { p, confidence, label, tone, reasons };
}
