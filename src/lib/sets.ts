import type { ChapterId, LicenseId, Question } from "@/lib/types";
import { questionsFor } from "@/data/questions";
import { CHAPTERS } from "@/data/chapters";
import { getLicense } from "@/data/licenses";
import type { QStat } from "@/store/progress";
import { shuffle } from "./random";
import { getTopic, topicSet, topicsFor, weaknessSet } from "./topics";

export const STATIC_SETS = ["hom-nay", "tat-ca", "diem-liet", "cau-sai", "ngau-nhien", "da-luu", "co-meo", "mo-phong"] as const;

export const DAILY_SIZE = 20;

export function setKeysFor(license: LicenseId): string[] {
  const group = getLicense(license)!.group;
  return [
    ...STATIC_SETS,
    "diem-yeu",
    ...CHAPTERS.filter((c) => c.groups.includes(group)).map((c) => `chuong-${c.id}`),
    ...topicsFor(license).map((t) => `chu-de-${t.id}`),
  ];
}

export function setMeta(key: string): { title: string; desc: string; icon: string } {
  if (key.startsWith("chu-de-")) {
    const t = getTopic(key.slice(7));
    if (t) return { title: t.name, desc: t.hint, icon: t.icon };
  }
  if (key === "diem-yeu") return { title: "Luyện điểm yếu", desc: "Câu hỏi từ các chủ đề bạn hay sai nhất", icon: "🩺" };
  if (key.startsWith("chuong-")) {
    const ch = CHAPTERS.find((c) => c.id === Number(key.slice(7)));
    if (ch) return { title: ch.short, desc: ch.name, icon: ch.icon };
  }
  switch (key) {
    case "hom-nay":
      return { title: "Ôn tập hôm nay", desc: "Lặp lại ngắt quãng: câu đến hạn ôn + câu mới", icon: "📅" };
    case "tat-ca":
      return { title: "Toàn bộ câu hỏi", desc: "Chạy lần lượt qua tất cả các trạm", icon: "🛣️" };
    case "diem-liet":
      return { title: "Câu điểm liệt", desc: "Sai một câu là trượt — phải thuộc lòng", icon: "⚠️" };
    case "cau-sai":
      return { title: "Câu hay sai", desc: "Những câu bạn trả lời sai ở lần gần nhất", icon: "🔁" };
    case "ngau-nhien":
      return { title: "Chạy ngẫu nhiên", desc: "20 câu bất kỳ — khởi động nhanh", icon: "🎲" };
    case "da-luu":
      return { title: "Câu đã lưu", desc: "Các câu bạn đánh dấu để ôn lại", icon: "🔖" };
    case "co-meo":
      return { title: "Học theo mẹo", desc: "Các câu có mẹo nhớ — luyện để thuộc mẹo", icon: "💡" };
    case "mo-phong":
      return { title: "Tình huống mô phỏng", desc: "Câu có hình động: sa hình, tình huống trên đường — thử chọn sai để xem hậu quả", icon: "🎬" };
  }
  return { title: "Ôn tập", desc: "", icon: "📘" };
}

export function buildSet(
  license: LicenseId,
  key: string,
  stats: Record<number, QStat>,
  bookmarks: number[],
): Question[] {
  const all = questionsFor(license);
  if (key.startsWith("chuong-")) {
    const ch = Number(key.slice(7)) as ChapterId;
    return all.filter((q) => q.chapter === ch);
  }
  if (key.startsWith("chu-de-")) return topicSet(license, key.slice(7), stats);
  if (key === "diem-yeu") return weaknessSet(license, stats);
  switch (key) {
    case "hom-nay":
      return dailySet(all, stats);
    case "diem-liet":
      return all.filter((q) => q.critical);
    case "cau-sai":
      return all.filter((q) => stats[q.id]?.last === 0);
    case "ngau-nhien":
      return shuffle(all).slice(0, 20);
    case "da-luu":
      return all.filter((q) => bookmarks.includes(q.id));
    case "co-meo":
      return all.filter((q) => q.tip);
    case "mo-phong":
      return shuffle(all.filter((q) => q.scene || q.consequences));
    default:
      return all;
  }
}

/** Câu đến hạn ôn (theo hộp Leitner), ưu tiên câu quá hạn lâu và câu điểm liệt. */
export function dueQuestions(all: Question[], stats: Record<number, QStat>, now = Date.now()) {
  return all
    .filter((q) => {
      const st = stats[q.id];
      return st && (st.due ?? st.t) <= now;
    })
    .sort((a, b) => Number(!!b.critical) - Number(!!a.critical) || (stats[a.id].due ?? 0) - (stats[b.id].due ?? 0));
}

/** Bài ôn hằng ngày: câu đến hạn trước, sau đó bổ sung câu chưa học (ưu tiên điểm liệt, trải đều các chương). */
export function dailySet(all: Question[], stats: Record<number, QStat>) {
  const due = dueQuestions(all, stats).slice(0, DAILY_SIZE);
  if (due.length >= DAILY_SIZE) return due;
  const fresh = all.filter((q) => !stats[q.id]);
  const critical = fresh.filter((q) => q.critical);
  const others = shuffle(fresh.filter((q) => !q.critical));
  const picked = [...critical.slice(0, 3), ...others].slice(0, DAILY_SIZE - due.length);
  return [...due, ...picked];
}
