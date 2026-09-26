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
  | "P.101" | "P.102" | "P.103a" | "P.103b" | "P.103c" | "P.104" | "P.105" | "P.106a" | "P.107" | "P.107a"
  | "P.108" | "P.110a" | "P.111a" | "P.112" | "P.115" | "P.116" | "P.117" | "P.118" | "P.119" | "P.121"
  | "P.123a" | "P.123b" | "P.124a" | "P.124b" | "P.124c" | "P.125" | "P.126" | "P.127" | "P.128" | "P.129"
  | "P.130" | "P.131a" | "P.132" | "P.133" | "P.134" | "DP.135" | "P.136" | "P.137" | "P.138" | "P.139"
  | "W.201a" | "W.201b" | "W.202a" | "W.203a" | "W.204" | "W.205a" | "W.206" | "W.207a" | "W.208" | "W.209"
  | "W.210" | "W.211a" | "W.212" | "W.215a" | "W.217" | "W.219" | "W.220" | "W.221a" | "W.222a" | "W.224"
  | "W.225" | "W.226" | "W.227" | "W.228a" | "W.230" | "W.231" | "W.232" | "W.233" | "W.235" | "W.236"
  | "W.238" | "W.240" | "W.241" | "W.242a" | "W.244" | "W.245a" | "W.246a"
  | "R.122" | "R.301a" | "R.301b" | "R.301c" | "R.301f" | "R.301h" | "R.302a" | "R.302b" | "R.303" | "R.304"
  | "R.305" | "R.306" | "R.307" | "R.309" | "R.403a" | "R.403b" | "R.404a" | "R.412a"
  | "I.401" | "I.402" | "I.405a" | "I.406" | "I.407a" | "I.408" | "I.409" | "I.410" | "I.420" | "I.421"
  | "I.423" | "I.424a" | "I.425" | "I.426" | "I.428" | "I.434a" | "I.436" | "I.437" | "I.438";

/** Loại hậu quả khi mô phỏng một cách xử lý sai. */
export type ConsequenceKind = "crash" | "ticket" | "danger" | "ok";

/** Điều gì xảy ra nếu người học chọn một đáp án (dùng cho mô phỏng "nếu làm vậy thì sao"). */
export interface Consequence {
  kind: ConsequenceKind;
  /** Mô tả ngắn hậu quả: va chạm với xe nào, mức phạt, điểm trừ GPLX… */
  text: string;
}

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
  /**
   * Hậu quả giả lập của từng đáp án (cùng chỉ số với `options`; đáp án đúng để `null`).
   * Câu sa hình không khai báo sẽ được suy ra tự động từ thứ tự xe trong đáp án (lib/whatif).
   */
  consequences?: (Consequence | null)[];
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
