"use client";

import { useId, type ReactNode } from "react";
import type { DiagramKind } from "@/data/journey";
import { TopVehicle } from "@/components/scene/sprites";

interface Seg {
  d: string;
  dur: number;
  reverse?: boolean;
  /** dừng tại vị trí (tỉ lệ 0..1 của đoạn) trong `hold` giây */
  hold?: [number, number];
}

const ROAD = "#3f4450";
const LINE = "#f8fafc";

/** Sơ đồ bài thi sa hình, xe chạy bằng hoạt ảnh SVG (SMIL) lặp lại. */
export function CourseDiagram({ kind }: { kind: DiagramKind }) {
  const raw = useId();
  const id = "d" + raw.replace(/[^a-zA-Z0-9]/g, "");
  const cfg = DIAGRAMS[kind];
  const moto = ["so-8", "duong-thang", "vach-can", "go-ghe"].includes(kind);
  return (
    <svg viewBox="0 0 320 180" className="block h-full w-full" role="img" aria-label="Sơ đồ bài thi">
      <rect width={320} height={180} fill="#4d7c2f" />
      {cfg.bg(id)}
      <Mover id={id} segs={cfg.segs} moto={moto} blink={cfg.blink} hazard={kind === "nguy-hiem"} />
    </svg>
  );
}

function timing(seg: Seg) {
  if (!seg.hold) return { dur: seg.dur, keyPoints: undefined, keyTimes: undefined };
  const [f, h] = seg.hold;
  const T = seg.dur + h;
  const t1 = (f * seg.dur) / T;
  const t2 = (f * seg.dur + h) / T;
  return { dur: T, keyPoints: `0;${f};${f};1`, keyTimes: `0;${t1.toFixed(3)};${t2.toFixed(3)};1` };
}

function Mover({ id, segs, moto, blink, hazard }: { id: string; segs: Seg[]; moto: boolean; blink?: "left" | "right"; hazard?: boolean }) {
  const n = segs.length;
  return (
    <g>
      {segs.map((s, i) => {
        const t = timing(s);
        const begin = i === 0 ? `0s;${id}-${n - 1}.end+0.8s` : `${id}-${i - 1}.end`;
        return (
          <animateMotion
            key={i}
            id={`${id}-${i}`}
            path={s.d}
            dur={`${t.dur}s`}
            begin={begin}
            fill="freeze"
            rotate={s.reverse ? "auto-reverse" : "auto"}
            {...(t.keyPoints ? { keyPoints: t.keyPoints, keyTimes: t.keyTimes, calcMode: "linear" } : {})}
          />
        );
      })}
      <g transform={moto ? "scale(1.3)" : "scale(0.9)"}>
        <TopVehicle kind={moto ? "moto" : "car"} color="#ef4444" blink={blink} />
        {hazard && (
          <g className="blinker" fill="#fbbf24">
            <circle cx={19} cy={-9} r={3} />
            <circle cx={19} cy={9} r={3} />
            <circle cx={-19} cy={-9} r={3} />
            <circle cx={-19} cy={9} r={3} />
          </g>
        )}
      </g>
    </g>
  );
}

function HRoad({ y = 70, h = 40, x1 = -10, x2 = 330 }: { y?: number; h?: number; x1?: number; x2?: number }) {
  return (
    <g>
      <rect x={x1} y={y - 4} width={x2 - x1} height={h + 8} fill="#d6d3d1" />
      <rect x={x1} y={y} width={x2 - x1} height={h} fill={ROAD} />
      <line x1={x1} x2={x2} y1={y + 2} y2={y + 2} stroke={LINE} strokeWidth={1.5} />
      <line x1={x1} x2={x2} y1={y + h - 2} y2={y + h - 2} stroke={LINE} strokeWidth={1.5} />
    </g>
  );
}

function Label({ x, y, children, color = "#fff" }: { x: number; y: number; children: ReactNode; color?: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={10} fontWeight={800} fill={color} fontFamily="Arial" stroke="#0008" strokeWidth={2.5} paintOrder="stroke">
      {children}
    </text>
  );
}

function StopLine({ x, y, h }: { x: number; y: number; h: number }) {
  return <line x1={x} x2={x} y1={y} y2={y + h} stroke={LINE} strokeWidth={4} />;
}

const DIAGRAMS: Record<DiagramKind, { bg: (id: string) => ReactNode; segs: Seg[]; blink?: "left" | "right" }> = {
  "xuat-phat": {
    bg: () => (
      <>
        <HRoad y={70} />
        <StopLine x={100} y={70} h={40} />
        <Label x={100} y={62}>VẠCH XUẤT PHÁT</Label>
        <Label x={50} y={130} color="#fde68a">Thắt dây · Xi nhan trái</Label>
      </>
    ),
    segs: [{ d: "M60,90 L350,90", dur: 3.2, hold: [0, 1.2] }],
    blink: "left",
  },
  "di-bo": {
    bg: () => (
      <>
        <HRoad y={70} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={196} y={72 + i * 8} width={22} height={4.5} fill={LINE} />
        ))}
        <StopLine x={186} y={70} h={40} />
        <Label x={186} y={62}>VẠCH DỪNG</Label>
        <Label x={186} y={130} color="#fde68a">Đầu xe cách vạch ≤ 500 mm</Label>
      </>
    ),
    segs: [{ d: "M-30,90 L350,90", dur: 4, hold: [(164 + 30) / 380, 1.5] }],
  },
  doc: {
    bg: (id) => (
      <>
        <defs>
          <linearGradient id={`${id}-g`} x1="0" x2="1">
            <stop offset="0" stopColor={ROAD} />
            <stop offset="0.5" stopColor="#6b7280" />
            <stop offset="1" stopColor={ROAD} />
          </linearGradient>
        </defs>
        <HRoad y={70} />
        <rect x={110} y={70} width={130} height={40} fill={`url(#${id}-g)`} />
        <StopLine x={186} y={70} h={40} />
        <Label x={175} y={62}>DỐC · VẠCH DỪNG</Label>
        <Label x={175} y={130} color="#fde68a">Khởi hành ≤ 30 s · không tụt dốc</Label>
      </>
    ),
    segs: [{ d: "M-30,90 L350,90", dur: 4, hold: [(164 + 30) / 380, 1.8] }],
  },
  "vet-banh": {
    bg: () => (
      <>
        <rect x={-10} y={110} width={200} height={40} fill={ROAD} />
        <rect x={150} y={-10} width={40} height={160} fill={ROAD} />
        <rect x={40} y={140} width={90} height={6} fill="#a8a29e" stroke="#f8fafc" strokeWidth={1} />
        <Label x={85} y={165} color="#fde68a">Vệt bánh xe</Label>
        <path d="M-10,112 L152,112 L152,-10 M-10,148 L188,148 L188,-10" stroke={LINE} strokeWidth={1.5} fill="none" />
        <Label x={235} y={60} color="#fde68a">Đường hẹp vuông góc</Label>
      </>
    ),
    segs: [{ d: "M-30,130 L150,130 Q170,130 170,110 L170,-30", dur: 4.2 }],
  },
  "nga-tu": {
    bg: (id) => (
      <>
        <HRoad y={70} />
        <rect x={150} y={-10} width={40} height={200} fill={ROAD} />
        <StopLine x={140} y={70} h={40} />
        <g transform="translate(128 38)">
          <rect x={-7} y={-18} width={14} height={34} rx={3} fill="#0f172a" />
          <circle cx={0} cy={-9} r={4.5} fill="#ef4444">
            <animate attributeName="opacity" values="1;1;0.2;0.2" keyTimes="0;0.55;0.55;1" dur="5.2s" begin={`${id}-0.begin`} fill="freeze" />
          </circle>
          <circle cx={0} cy={7} r={4.5} fill="#22c55e">
            <animate attributeName="opacity" values="0.2;0.2;1;1" keyTimes="0;0.55;0.55;1" dur="5.2s" begin={`${id}-0.begin`} fill="freeze" />
          </circle>
        </g>
        <Label x={230} y={140} color="#fde68a">Đỏ: dừng trước vạch</Label>
      </>
    ),
    segs: [{ d: "M-30,90 L350,90", dur: 3.4, hold: [(118 + 30) / 380, 1.8] }],
  },
  "quanh-co": {
    bg: () => (
      <>
        <path d="M-30,140 C60,140 80,40 160,40 S260,140 350,140" stroke={LINE} strokeWidth={46} fill="none" />
        <path d="M-30,140 C60,140 80,40 160,40 S260,140 350,140" stroke={ROAD} strokeWidth={40} fill="none" />
        <Label x={160} y={96} color="#fde68a">Chữ S · không đè vạch</Label>
      </>
    ),
    segs: [{ d: "M-30,140 C60,140 80,40 160,40 S260,140 350,140", dur: 5 }],
  },
  "ghep-doc": {
    bg: () => (
      <>
        <HRoad y={110} />
        <rect x={148} y={40} width={44} height={72} fill={ROAD} />
        <path d="M148,112 L148,40 L192,40 L192,112" stroke={LINE} strokeWidth={2} fill="none" />
        <rect x={150} y={40} width={40} height={6} fill="#facc15" />
        <Label x={170} y={32}>NƠI ĐỖ</Label>
        <Label x={260} y={100} color="#fde68a">Tiến qua rồi lùi vào</Label>
      </>
    ),
    segs: [
      { d: "M-30,130 L240,130", dur: 3 },
      { d: "M240,130 Q170,130 170,95 L170,68", dur: 3, reverse: true },
    ],
  },
  "duong-sat": {
    bg: () => (
      <>
        <HRoad y={70} />
        <rect x={205} y={-10} width={24} height={200} fill="#57534e" />
        <line x1={210} x2={210} y1={-10} y2={190} stroke="#d4d4d8" strokeWidth={2} />
        <line x1={224} x2={224} y1={-10} y2={190} stroke="#d4d4d8" strokeWidth={2} />
        <StopLine x={186} y={70} h={40} />
        <Label x={186} y={62}>VẠCH DỪNG</Label>
        <Label x={250} y={140} color="#fde68a">Đường sắt</Label>
      </>
    ),
    segs: [{ d: "M-30,90 L350,90", dur: 4, hold: [(164 + 30) / 380, 1.5] }],
  },
  "tang-so": {
    bg: () => (
      <>
        <HRoad y={70} />
        <rect x={60} y={70} width={110} height={40} fill="#16a34a" opacity={0.28} />
        <rect x={170} y={70} width={110} height={40} fill="#f59e0b" opacity={0.25} />
        <Label x={115} y={62}>TĂNG SỐ · TĂNG TỐC</Label>
        <Label x={225} y={62}>GIẢM SỐ · GIẢM TỐC</Label>
        <Label x={115} y={128} color="#fde68a">vượt ngưỡng tốc độ</Label>
        <Label x={225} y={128} color="#fde68a">về số, tốc độ ban đầu</Label>
      </>
    ),
    segs: [{ d: "M-30,90 L350,90", dur: 3.4 }],
  },
  "ghep-ngang": {
    bg: () => (
      <>
        <HRoad y={80} h={70} />
        <rect x={130} y={52} width={84} height={30} fill={ROAD} />
        <path d="M130,82 L130,52 L214,52 L214,82" stroke={LINE} strokeWidth={2} fill="none" />
        <g transform="translate(108 67)">
          <TopVehicle kind="car" color="#64748b" />
        </g>
        <g transform="translate(236 67)">
          <TopVehicle kind="car" color="#64748b" />
        </g>
        <Label x={172} y={46}>NƠI ĐỖ</Label>
      </>
    ),
    segs: [
      { d: "M-30,125 L260,125", dur: 3 },
      { d: "M260,125 C205,125 210,67 172,67", dur: 3.2, reverse: true },
    ],
  },
  "ket-thuc": {
    bg: () => (
      <>
        <HRoad y={70} />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={i % 2 ? 232 : 226} y={70 + i * 4} width={6} height={4} fill={LINE} />
        ))}
        <Label x={232} y={62}>VẠCH KẾT THÚC</Label>
        <Label x={232} y={130} color="#fde68a">Xi nhan phải trước vạch</Label>
      </>
    ),
    segs: [{ d: "M-30,90 L350,90", dur: 3.6 }],
    blink: "right",
  },
  "nguy-hiem": {
    bg: () => (
      <>
        <HRoad y={70} />
        <g className="blink-a">
          <polygon points="160,20 180,52 140,52" fill="#facc15" stroke="#dc2626" strokeWidth={3} />
          <text x={160} y={48} textAnchor="middle" fontSize={20} fontWeight={900} fill="#111">!</text>
        </g>
        <Label x={160} y={134} color="#fde68a">Dừng trong 3 s · bật đèn khẩn cấp</Label>
      </>
    ),
    segs: [{ d: "M-30,90 L350,90", dur: 3.6, hold: [0.5, 2] }],
  },
  "so-8": {
    bg: () => (
      <>
        <path
          d="M160,90 C160,38 58,38 58,90 C58,142 160,142 160,90 C160,38 262,38 262,90 C262,142 160,142 160,90"
          stroke={LINE}
          strokeWidth={34}
          fill="none"
        />
        <path
          d="M160,90 C160,38 58,38 58,90 C58,142 160,142 160,90 C160,38 262,38 262,90 C262,142 160,142 160,90"
          stroke={ROAD}
          strokeWidth={30}
          fill="none"
        />
        <Label x={160} y={170} color="#fde68a">Không chạm vạch · không chống chân</Label>
      </>
    ),
    segs: [{ d: "M160,90 C160,38 58,38 58,90 C58,142 160,142 160,90 C160,38 262,38 262,90 C262,142 160,142 160,90", dur: 7 }],
  },
  "duong-thang": {
    bg: () => (
      <>
        <rect x={-10} y={76} width={340} height={28} fill={ROAD} />
        <line x1={-10} x2={330} y1={76} y2={76} stroke={LINE} strokeWidth={2} />
        <line x1={-10} x2={330} y1={104} y2={104} stroke={LINE} strokeWidth={2} />
        <Label x={160} y={130} color="#fde68a">Đi thẳng giữa hai vạch</Label>
      </>
    ),
    segs: [{ d: "M-20,90 L340,90", dur: 3.6 }],
  },
  "vach-can": {
    bg: () => (
      <>
        <rect x={-10} y={46} width={340} height={88} fill={ROAD} />
        {[60, 140, 220].map((x) => (
          <rect key={x} x={x} y={92} width={8} height={42} fill="#f8fafc" />
        ))}
        {[100, 180, 260].map((x) => (
          <rect key={x} x={x} y={46} width={8} height={42} fill="#f8fafc" />
        ))}
        <Label x={160} y={160} color="#fde68a">Lượn qua vạch cản so le</Label>
      </>
    ),
    segs: [{ d: "M-20,110 C30,110 40,70 64,70 S90,112 104,112 S130,70 144,70 S170,112 184,112 S210,70 224,70 S250,112 264,112 S300,90 340,90", dur: 5.5 }],
  },
  "go-ghe": {
    bg: () => (
      <>
        <rect x={-10} y={70} width={340} height={40} fill={ROAD} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={90 + i * 12} y={72} width={6} height={36} fill="#78716c" />
        ))}
        <Label x={160} y={132} color="#fde68a">Giữ ga đều, không chống chân</Label>
      </>
    ),
    segs: [{ d: "M-20,90 L340,90", dur: 4.2 }],
  },
};
