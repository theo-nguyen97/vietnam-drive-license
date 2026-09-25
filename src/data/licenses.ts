import type { License, LicenseId } from "@/lib/types";

/**
 * Các hạng giấy phép lái xe theo Luật Trật tự, an toàn giao thông đường bộ 2024
 * (hiệu lực từ 01/01/2025). Số câu / thời gian / điểm đạt của đề lý thuyết theo
 * Thông tư 12/2025/TT-BCA (bộ câu hỏi áp dụng từ 01/6/2025): A1, A dùng bộ 250 câu,
 * B1 dùng bộ 300 câu, các hạng ô tô dùng bộ 600 câu.
 */
export const LICENSES: License[] = [
  {
    id: "A1", bank: 250, name: "Hạng A1", short: "Mô tô đến 125 cm³",
    desc: "Xe mô tô hai bánh có dung tích xi-lanh đến 125 cm³ hoặc công suất động cơ điện đến 11 kW.",
    group: "moto", family: "moto", vehicle: "scooter",
    exam: { total: 25, minutes: 19, pass: 21 }, minAge: 18, validity: "Không thời hạn", color: "#22c55e",
  },
  {
    id: "A", bank: 250, name: "Hạng A", short: "Mô tô trên 125 cm³",
    desc: "Xe mô tô hai bánh có dung tích xi-lanh trên 125 cm³ hoặc công suất động cơ điện trên 11 kW và các loại xe của hạng A1.",
    group: "moto", family: "moto", vehicle: "bigbike",
    exam: { total: 25, minutes: 19, pass: 23 }, minAge: 18, validity: "Không thời hạn", color: "#10b981",
  },
  {
    id: "B1", bank: 300, name: "Hạng B1", short: "Mô tô ba bánh",
    desc: "Xe mô tô ba bánh và các loại xe quy định cho giấy phép lái xe hạng A1.",
    group: "moto", family: "moto", vehicle: "trike",
    exam: { total: 25, minutes: 19, pass: 23 }, minAge: 18, validity: "Không thời hạn", color: "#14b8a6",
  },
  {
    id: "B", bank: 600, name: "Hạng B", short: "Ô tô đến 8 chỗ, tải ≤ 3,5 tấn",
    desc: "Ô tô chở người đến 08 chỗ (không kể chỗ người lái); ô tô tải, ô tô chuyên dùng có khối lượng toàn bộ theo thiết kế đến 3.500 kg; kéo rơ moóc đến 750 kg.",
    group: "car", family: "light", vehicle: "car",
    exam: { total: 30, minutes: 20, pass: 27 }, minAge: 18, validity: "10 năm", color: "#3b82f6",
  },
  {
    id: "C1", bank: 600, name: "Hạng C1", short: "Tải 3,5 – 7,5 tấn",
    desc: "Ô tô tải, ô tô chuyên dùng có khối lượng toàn bộ theo thiết kế trên 3.500 kg đến 7.500 kg; kéo rơ moóc đến 750 kg; các loại xe hạng B.",
    group: "car", family: "light", vehicle: "pickup",
    exam: { total: 35, minutes: 22, pass: 32 }, minAge: 18, validity: "10 năm", color: "#6366f1",
  },
  {
    id: "C", bank: 600, name: "Hạng C", short: "Tải trên 7,5 tấn",
    desc: "Ô tô tải, ô tô chuyên dùng có khối lượng toàn bộ theo thiết kế trên 7.500 kg; kéo rơ moóc đến 750 kg; các loại xe hạng B, C1.",
    group: "car", family: "heavy", vehicle: "truck",
    exam: { total: 40, minutes: 24, pass: 36 }, minAge: 21, validity: "05 năm", color: "#f97316",
  },
  {
    id: "D1", bank: 600, name: "Hạng D1", short: "Khách 9 – 16 chỗ",
    desc: "Ô tô chở người trên 08 chỗ đến 16 chỗ (không kể chỗ người lái); kéo rơ moóc đến 750 kg; các loại xe hạng B, C1, C.",
    group: "car", family: "passenger", vehicle: "van",
    exam: { total: 45, minutes: 26, pass: 41 }, minAge: 24, validity: "05 năm", color: "#eab308",
  },
  {
    id: "D2", bank: 600, name: "Hạng D2", short: "Khách 17 – 29 chỗ",
    desc: "Ô tô chở người (kể cả xe buýt) trên 16 chỗ đến 29 chỗ (không kể chỗ người lái); kéo rơ moóc đến 750 kg; các loại xe hạng B, C1, C, D1.",
    group: "car", family: "passenger", vehicle: "bus",
    exam: { total: 45, minutes: 26, pass: 41 }, minAge: 24, validity: "05 năm", color: "#f59e0b",
  },
  {
    id: "D", bank: 600, name: "Hạng D", short: "Khách trên 29 chỗ",
    desc: "Ô tô chở người (kể cả xe buýt) trên 29 chỗ; xe ô tô chở người giường nằm; kéo rơ moóc đến 750 kg; các loại xe hạng B, C1, C, D1, D2.",
    group: "car", family: "passenger", vehicle: "bus",
    exam: { total: 45, minutes: 26, pass: 41 }, minAge: 27, validity: "05 năm", color: "#ef4444",
  },
  {
    id: "BE", bank: 600, name: "Hạng BE", short: "B kéo rơ moóc > 750 kg",
    desc: "Xe ô tô quy định cho hạng B kéo rơ moóc có khối lượng toàn bộ theo thiết kế trên 750 kg.",
    group: "car", family: "trailer", vehicle: "trailer",
    exam: { total: 45, minutes: 26, pass: 41 }, minAge: 21, validity: "05 năm", color: "#a855f7",
  },
  {
    id: "C1E", bank: 600, name: "Hạng C1E", short: "C1 kéo rơ moóc > 750 kg",
    desc: "Xe ô tô quy định cho hạng C1 kéo rơ moóc có khối lượng toàn bộ theo thiết kế trên 750 kg.",
    group: "car", family: "trailer", vehicle: "trailer",
    exam: { total: 45, minutes: 26, pass: 41 }, minAge: 24, validity: "05 năm", color: "#c026d3",
  },
  {
    id: "CE", bank: 600, name: "Hạng CE", short: "Đầu kéo, sơ mi rơ moóc",
    desc: "Xe ô tô quy định cho hạng C kéo rơ moóc trên 750 kg; xe ô tô đầu kéo kéo sơ mi rơ moóc.",
    group: "car", family: "trailer", vehicle: "trailer",
    exam: { total: 45, minutes: 26, pass: 41 }, minAge: 24, validity: "05 năm", color: "#db2777",
  },
  {
    id: "D1E", bank: 600, name: "Hạng D1E", short: "D1 kéo rơ moóc > 750 kg",
    desc: "Xe ô tô quy định cho hạng D1 kéo rơ moóc có khối lượng toàn bộ theo thiết kế trên 750 kg.",
    group: "car", family: "trailer", vehicle: "trailer",
    exam: { total: 45, minutes: 26, pass: 41 }, minAge: 27, validity: "05 năm", color: "#e11d48",
  },
  {
    id: "D2E", bank: 600, name: "Hạng D2E", short: "D2 kéo rơ moóc > 750 kg",
    desc: "Xe ô tô quy định cho hạng D2 kéo rơ moóc có khối lượng toàn bộ theo thiết kế trên 750 kg.",
    group: "car", family: "trailer", vehicle: "trailer",
    exam: { total: 45, minutes: 26, pass: 41 }, minAge: 27, validity: "05 năm", color: "#be123c",
  },
  {
    id: "DE", bank: 600, name: "Hạng DE", short: "D kéo rơ moóc, xe nối toa",
    desc: "Xe ô tô quy định cho hạng D kéo rơ moóc trên 750 kg; xe ô tô chở khách nối toa.",
    group: "car", family: "trailer", vehicle: "trailer",
    exam: { total: 45, minutes: 26, pass: 41 }, minAge: 27, validity: "05 năm", color: "#9f1239",
  },
];

export const FAMILIES: { id: License["family"]; name: string; hint: string }[] = [
  { id: "moto", name: "Xe máy", hint: "A1 · A · B1" },
  { id: "light", name: "Ô tô con & tải nhẹ", hint: "B · C1" },
  { id: "heavy", name: "Tải nặng", hint: "C" },
  { id: "passenger", name: "Xe chở khách", hint: "D1 · D2 · D" },
  { id: "trailer", name: "Kéo rơ moóc", hint: "BE · C1E · CE · D1E · D2E · DE" },
];

export const LICENSE_IDS = LICENSES.map((l) => l.id);

export function getLicense(id: string): License | undefined {
  return LICENSES.find((l) => l.id.toLowerCase() === id.toLowerCase());
}

export function licenseSlug(id: LicenseId) {
  return id.toLowerCase();
}
