import type { LicenseId, Question, VehicleGroup } from "@/lib/types";
import { getSign } from "@/data/signs";
import { getLicense } from "@/data/licenses";
import { questionsFor } from "@/data/questions";
import type { QStat } from "@/store/progress";

export interface Topic {
  id: string;
  /** Mã lỗi hiển thị kiểu máy chẩn đoán ô tô */
  code: string;
  name: string;
  icon: string;
  hint: string;
  groups?: VehicleGroup[];
}

/** Các chủ đề nhỏ dùng để chẩn đoán điểm yếu (mịn hơn 6 chương). */
export const TOPICS: Topic[] = [
  { id: "diem-liet", code: "E-01", name: "Tình huống mất an toàn nghiêm trọng", icon: "⚠️", hint: "Câu điểm liệt: cồn, ma tuý, cao tốc, bỏ trốn, vượt đèn đỏ…" },
  { id: "khai-niem", code: "E-02", name: "Khái niệm & quy định chung", icon: "📘", hint: "Phần đường, làn đường, người tham gia giao thông, xe cơ giới…" },
  { id: "tin-hieu", code: "E-03", name: "Đèn tín hiệu & người điều khiển", icon: "🚦", hint: "Ý nghĩa đèn, hiệu lệnh CSGT, thứ tự chấp hành báo hiệu." },
  { id: "toc-do", code: "E-04", name: "Tốc độ & khoảng cách an toàn", icon: "⏱️", hint: "Tốc độ tối đa trong/ngoài khu dân cư, khoảng cách tối thiểu." },
  { id: "vuot-quay-dau", code: "E-05", name: "Vượt xe, chuyển hướng, quay đầu, lùi", icon: "↩️", hint: "Vượt bên trái, nơi cấm vượt, cấm quay đầu, khi lùi xe." },
  { id: "dung-do", code: "E-06", name: "Dừng xe, đỗ xe", icon: "🅿️", hint: "Sát lề 0,25 m, cấm dừng đỗ trong 5 m nơi giao nhau…" },
  { id: "nhuong-duong", code: "E-07", name: "Nhường đường & xe ưu tiên", icon: "🚑", hint: "Thứ tự xe ưu tiên, tránh xe, lên dốc – xuống dốc, vòng xuyến." },
  { id: "cao-toc-duong-sat", code: "E-08", name: "Cao tốc, hầm & đường sắt", icon: "🛣️", hint: "Vào/ra cao tốc, làn dừng khẩn cấp, giao cắt đường sắt, hầm." },
  { id: "an-toan", code: "E-09", name: "Chở người, mũ bảo hiểm, dây an toàn", icon: "⛑️", hint: "Số người được chở, trẻ em trên ô tô, người ngồi sau xe máy." },
  { id: "gplx", code: "E-10", name: "Giấy phép lái xe & điểm GPLX", icon: "🪪", hint: "Hạng bằng, độ tuổi, thời hạn, 12 điểm và phục hồi điểm." },
  { id: "van-hoa", code: "E-11", name: "Văn hoá, đạo đức, cứu nạn & PCCC", icon: "🤝", hint: "Ứng xử, sơ cứu, gọi 113/114/115, chữa cháy." },
  { id: "ky-thuat", code: "E-12", name: "Kỹ thuật lái xe", icon: "🛞", hint: "Xuống dốc, đường trơn, vào cua, ban đêm, điểm mù." },
  { id: "cau-tao", code: "E-13", name: "Cấu tạo & sửa chữa", icon: "🔧", hint: "Động cơ, ly hợp, hộp số, phanh, đèn cảnh báo.", groups: ["car"] },
  { id: "bien-cam", code: "E-14", name: "Biển báo cấm", icon: "⛔", hint: "Tròn viền đỏ: cấm xe, cấm rẽ, cấm dừng đỗ, tốc độ tối đa." },
  { id: "bien-nguy-hiem", code: "E-15", name: "Biển nguy hiểm & cảnh báo", icon: "🔺", hint: "Tam giác vàng: giao nhau, đường sắt, trẻ em, công trường." },
  { id: "bien-hieu-lenh", code: "E-16", name: "Biển hiệu lệnh & chỉ dẫn", icon: "🔵", hint: "Tròn/vuông xanh: hướng đi, vòng xuyến, đường ưu tiên, nơi đỗ xe." },
  { id: "sa-hinh-thu-tu", code: "E-17", name: "Sa hình: thứ tự qua giao lộ", icon: "✳️", hint: "Nhất chớm – nhì ưu – tam đường – tứ hướng, bên phải trống." },
  { id: "sa-hinh-vong-xuyen", code: "E-18", name: "Sa hình: vòng xuyến", icon: "🔄", hint: "Có biển vòng xuyến: nhường xe đến từ bên trái." },
  { id: "sa-hinh-tin-hieu", code: "E-19", name: "Sa hình: đèn & CSGT", icon: "👮", hint: "Đèn xanh/đỏ tại giao lộ, tư thế tay người điều khiển." },
  { id: "sa-hinh-vi-pham", code: "E-20", name: "Sa hình: nhận biết vi phạm", icon: "🚨", hint: "Xe nào vi phạm: vượt đèn, lấn vạch, quay đầu nơi cấm…" },
  { id: "tinh-huong", code: "E-21", name: "Xử lý tình huống thực tế", icon: "🧭", hint: "Mưa, sương mù, ban đêm, tai nạn phía trước, xe ưu tiên phía sau." },
];

const RULES_CH1: [RegExp, string][] = [
  [/giấy phép lái xe|hạng [A-D]|đủ bao nhiêu tuổi|đủ 16 tuổi|điểm (của )?giấy phép|12 điểm|phục hồi|trừ hết điểm/i, "gplx"],
  [/cao tốc|đường sắt|hầm đường bộ|kéo xe/i, "cao-toc-duong-sat"],
  [/tốc độ|khoảng cách an toàn/i, "toc-do"],
  [/dừng, đỗ|dừng xe, đỗ xe|đỗ xe|mở cửa xe/i, "dung-do"],
  [/vượt|quay đầu|lùi xe|chuyển hướng|chuyển làn|vạch kẻ đường/i, "vuot-quay-dau"],
  [/người điều khiển giao thông|đèn|hiệu lệnh|biển báo hiệu|còi/i, "tin-hieu"],
  [/ưu tiên|nhường|vòng xuyến|tránh nhau|đoàn xe|dốc/i, "nhuong-duong"],
  [/mô tô|mũ bảo hiểm|chở|dây đai|trẻ em/i, "an-toan"],
];

/** Một số câu phân loại thủ công vì từ khoá dễ gây nhầm. */
const OVERRIDES: Record<number, string> = { 40: "toc-do", 48: "gplx", 68: "nhuong-duong" };

const CACHE = new Map<number, string>();

export function topicOf(q: Question): string {
  if (q.topic) return q.topic;
  if (OVERRIDES[q.id]) return OVERRIDES[q.id];
  const hit = CACHE.get(q.id);
  if (hit) return hit;
  let t = "khai-niem";
  if (q.chapter === 1) {
    if (q.critical) t = "diem-liet";
    else t = RULES_CH1.find(([re]) => re.test(q.text))?.[1] ?? "khai-niem";
  } else if (q.chapter === 2) t = "van-hoa";
  else if (q.chapter === 3) t = "ky-thuat";
  else if (q.chapter === 4) t = "cau-tao";
  else if (q.chapter === 5) {
    const g = q.signs?.[0] ? getSign(q.signs[0]).group : "cam";
    t = g === "cam" ? "bien-cam" : g === "nguy-hiem" ? "bien-nguy-hiem" : "bien-hieu-lenh";
  } else if (q.chapter === 6) {
    const sc = q.scene;
    if (sc?.kind === "junction") {
      if (sc.violators?.length || sc.layout === "road") t = "sa-hinh-vi-pham";
      else if (sc.layout === "roundabout") t = "sa-hinh-vong-xuyen";
      else if (sc.police || sc.lights) t = "sa-hinh-tin-hieu";
      else t = "sa-hinh-thu-tu";
    } else t = "tinh-huong";
  }
  CACHE.set(q.id, t);
  return t;
}

export function getTopic(id: string) {
  return TOPICS.find((t) => t.id === id);
}

export function topicsFor(license: LicenseId) {
  const group = getLicense(license)!.group;
  const used = new Set(questionsFor(license).map(topicOf));
  return TOPICS.filter((t) => used.has(t.id) && (!t.groups || t.groups.includes(group)));
}

export type TopicStatus = "danger" | "warn" | "good" | "unknown";

export interface TopicReport {
  topic: Topic;
  total: number;
  seen: number;
  attempts: number;
  correct: number;
  wrongNow: number;
  /** tỉ lệ sai đã làm mượt (0..1) */
  risk: number;
  accuracy: number | null;
  status: TopicStatus;
}

/** Phân tích điểm yếu theo chủ đề từ lịch sử trả lời. */
export function analyze(license: LicenseId, stats: Record<number, QStat>): TopicReport[] {
  const qs = questionsFor(license);
  return topicsFor(license)
    .map((topic) => {
      const list = qs.filter((q) => topicOf(q) === topic.id);
      let c = 0;
      let w = 0;
      let seen = 0;
      let wrongNow = 0;
      for (const q of list) {
        const s = stats[q.id];
        if (!s) continue;
        seen++;
        c += s.c;
        w += s.w;
        if (s.last === 0) wrongNow++;
      }
      const attempts = c + w;
      // Làm mượt kiểu Bayes để chủ đề ít dữ liệu không bị đánh giá quá cực đoan;
      // câu đang sai ở lần gần nhất được tính nặng hơn.
      const risk = (w + wrongNow * 1.5 + 0.5) / (attempts + wrongNow * 1.5 + 4);
      const status: TopicStatus = attempts < 2 ? "unknown" : risk >= 0.33 ? "danger" : risk >= 0.16 ? "warn" : "good";
      return { topic, total: list.length, seen, attempts, correct: c, wrongNow, risk, accuracy: attempts ? c / attempts : null, status };
    })
    .sort((a, b) => {
      const order = { danger: 0, warn: 1, unknown: 3, good: 2 } as const;
      return order[a.status] - order[b.status] || b.risk - a.risk;
    });
}

/** Bài luyện theo chủ đề: câu đang sai → câu chưa làm → câu còn lại (ít đúng nhất trước). */
export function topicSet(license: LicenseId, topicId: string, stats: Record<number, QStat>) {
  const list = questionsFor(license).filter((q) => topicOf(q) === topicId);
  const rank = (q: Question) => {
    const s = stats[q.id];
    if (!s) return 1;
    if (s.last === 0) return 0;
    return 2 + (s.box ?? 0);
  };
  return list.slice().sort((a, b) => rank(a) - rank(b) || (stats[b.id]?.w ?? 0) - (stats[a.id]?.w ?? 0));
}

/** Bài luyện điểm yếu tổng hợp: lấy từ các chủ đề rủi ro nhất, tối đa `size` câu. */
export function weaknessSet(license: LicenseId, stats: Record<number, QStat>, size = 20) {
  const reports = analyze(license, stats).filter((r) => r.status === "danger" || r.status === "warn");
  const out: Question[] = [];
  const used = new Set<number>();
  // Phân bổ theo trọng số rủi ro, mỗi chủ đề ít nhất 2 câu.
  const totalRisk = reports.reduce((a, r) => a + r.risk, 0) || 1;
  for (const r of reports) {
    const quota = Math.max(2, Math.round((r.risk / totalRisk) * size));
    for (const q of topicSet(license, r.topic.id, stats).slice(0, quota)) {
      if (out.length >= size) break;
      if (!used.has(q.id)) {
        used.add(q.id);
        out.push(q);
      }
    }
  }
  return out;
}
