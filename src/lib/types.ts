export type LicenseId =
  | "A1" | "A" | "B1"
  | "B" | "C1" | "C"
  | "D1" | "D2" | "D"
  | "BE" | "C1E" | "CE" | "D1E" | "D2E" | "DE";

/** Nhóm phương tiện: xe máy (A1, A, B1) hoặc ô tô (các hạng còn lại). */
export type VehicleGroup = "moto" | "car";

export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6;

export type Dir = "N" | "S" | "E" | "W";
export type Move = "straight" | "left" | "right" | "uturn";
export type LightColor = "red" | "yellow" | "green";

export type TopVehicleKind =
  | "car" | "truck" | "bus" | "moto" | "bike"
  | "ambulance" | "fire" | "police";

export interface JunctionVehicle {
  id: string;
  kind: TopVehicleKind;
  from: Dir;
  move: Move;
  /** Nhãn hiển thị (mặc định theo loại xe). */
  label?: string;
  /** Xe của người chơi — được làm nổi bật. */
  player?: boolean;
  /** Xe đã vào trong giao lộ từ trước. */
  inside?: boolean;
  /** Xếp hàng phía sau xe khác cùng hướng (1, 2...). */
  queue?: number;
  color?: string;
  /** Quỹ đạo tuỳ biến (toạ độ 400x400) và độ dài đoạn tiếp cận. */
  custom?: { d: string; stop: number };
  /** Hệ số tốc độ khi mô phỏng (mặc định 1). */
  speed?: number;
}

export interface JunctionScene {
  kind: "junction";
  layout: "cross" | "tee" | "roundabout" | "road";
  vehicles: JunctionVehicle[];
  /** Thứ tự đi: mỗi phần tử là một nhóm xe đi cùng lúc. */
  order: string[][];
  violators?: string[];
  lights?: Partial<Record<"NS" | "EW", LightColor>>;
  /** CSGT đứng giữa giao lộ; facing = hướng mặt người điều khiển nhìn về. */
  police?: { pose: "up" | "side" | "forward"; facing: Dir };
  signs?: { at: Dir; code: SignCode }[];
  /** Đường ưu tiên. */
  main?: "NS" | "EW";
  /** Tất cả phải dừng. */
  stopAll?: boolean;
  /** Chú thích cho từng bước của mô phỏng. */
  steps?: string[];
  centerLine?: "solid" | "dashed";
}

export type RoadProp =
  | "light-red" | "light-yellow" | "light-green"
  | "police-up" | "police-side" | "police-forward"
  | "crosswalk" | "rail" | "school" | "rain" | "night"
  | "ambulance" | "accident" | "fire" | "highway" | "garage" | "fog";

export interface RoadScene {
  kind: "road";
  props?: RoadProp[];
}

export type Scene = JunctionScene | RoadScene;

export type SignCode =
  | "P.101" | "P.102" | "P.103a" | "P.104" | "P.105" | "P.106a" | "P.112"
  | "P.115" | "P.117" | "P.123a" | "P.123b" | "P.124a" | "P.125" | "P.127"
  | "P.128" | "P.130" | "P.131a" | "DP.135"
  | "W.201a" | "W.201b" | "W.205a" | "W.207a" | "W.208" | "W.209" | "W.210"
  | "W.211a" | "W.219" | "W.224" | "W.225" | "W.227" | "W.233" | "W.245a"
  | "R.122" | "R.301a" | "R.301b" | "R.301c" | "R.302a" | "R.303" | "R.304"
  | "R.305" | "R.306"
  | "I.401" | "I.402" | "I.407a" | "I.408" | "I.409" | "I.423" | "I.434a";

export interface Question {
  id: number;
  chapter: ChapterId;
  text: string;
  options: string[];
  /** Chỉ số (0-based) của đáp án đúng. */
  answer: number;
  explanation: string;
  /** Câu điểm liệt. */
  critical?: boolean;
  /** Chỉ áp dụng cho nhóm xe này (mặc định: tất cả). */
  only?: VehicleGroup;
  /** Biển báo minh hoạ, đánh số 1, 2, 3... */
  signs?: SignCode[];
  scene?: Scene;
  /** Mẹo ghi nhớ. */
  tip?: string;
  /** Chủ đề nhỏ (ghi đè cách phân loại tự động trong lib/topics). */
  topic?: string;
}

/** tt12: đề hiện hành (Thông tư 12/2025/TT-BCA) · tt108: đề từ 01/3/2027 (Thông tư 108/2026/TT-BCA). */
export type ExamVersion = "tt12" | "tt108";

export interface ExamConfig {
  total: number;
  minutes: number;
  pass: number;
}

export interface License {
  id: LicenseId;
  /** Bộ câu hỏi dùng cho hạng (250 / 300 / 600 câu). */
  bank: number;
  name: string;
  short: string;
  desc: string;
  group: VehicleGroup;
  family: "moto" | "light" | "heavy" | "passenger" | "trailer";
  vehicle: PlayerVehicle;
  exam: ExamConfig;
  /** Cấu trúc đề áp dụng từ 01/3/2027. */
  exam2027: ExamConfig;
  minAge: number;
  validity: string;
  color: string;
}

export type PlayerVehicle =
  | "scooter" | "bigbike" | "trike" | "car" | "pickup" | "truck" | "van" | "bus" | "trailer";
