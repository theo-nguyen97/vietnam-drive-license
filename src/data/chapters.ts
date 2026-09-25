import type { ChapterId, VehicleGroup } from "@/lib/types";

export interface Chapter {
  id: ChapterId;
  name: string;
  short: string;
  icon: string;
  groups: VehicleGroup[];
}

/** Cấu trúc 6 chương của bộ câu hỏi sát hạch lý thuyết. */
export const CHAPTERS: Chapter[] = [
  { id: 1, name: "Quy định chung và quy tắc giao thông đường bộ", short: "Quy tắc giao thông", icon: "⚖️", groups: ["moto", "car"] },
  { id: 2, name: "Văn hóa giao thông, đạo đức người lái xe, PCCC và cứu hộ, cứu nạn", short: "Văn hóa & đạo đức", icon: "🤝", groups: ["moto", "car"] },
  { id: 3, name: "Kỹ thuật lái xe", short: "Kỹ thuật lái xe", icon: "🛞", groups: ["moto", "car"] },
  { id: 4, name: "Cấu tạo và sửa chữa", short: "Cấu tạo & sửa chữa", icon: "🔧", groups: ["car"] },
  { id: 5, name: "Báo hiệu đường bộ", short: "Biển báo hiệu", icon: "🚸", groups: ["moto", "car"] },
  { id: 6, name: "Giải thế sa hình và kỹ năng xử lý tình huống giao thông", short: "Sa hình & tình huống", icon: "🚦", groups: ["moto", "car"] },
];

export function getChapter(id: ChapterId) {
  return CHAPTERS.find((c) => c.id === id)!;
}
