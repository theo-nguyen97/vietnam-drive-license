import type { ChapterId, LicenseId, Question } from "@/lib/types";
import { questionsFor } from "@/data/questions";
import { CHAPTERS } from "@/data/chapters";
import { getLicense } from "@/data/licenses";
import type { QStat } from "@/store/progress";
import { shuffle } from "./random";

export const STATIC_SETS = ["tat-ca", "diem-liet", "cau-sai", "ngau-nhien", "da-luu"] as const;

export function setKeysFor(license: LicenseId): string[] {
  const group = getLicense(license)!.group;
  return [...STATIC_SETS, ...CHAPTERS.filter((c) => c.groups.includes(group)).map((c) => `chuong-${c.id}`)];
}

export function setMeta(key: string): { title: string; desc: string; icon: string } {
  if (key.startsWith("chuong-")) {
    const ch = CHAPTERS.find((c) => c.id === Number(key.slice(7)));
    if (ch) return { title: ch.short, desc: ch.name, icon: ch.icon };
  }
  switch (key) {
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
  switch (key) {
    case "diem-liet":
      return all.filter((q) => q.critical);
    case "cau-sai":
      return all.filter((q) => stats[q.id]?.last === 0);
    case "ngau-nhien":
      return shuffle(all).slice(0, 20);
    case "da-luu":
      return all.filter((q) => bookmarks.includes(q.id));
    default:
      return all;
  }
}
