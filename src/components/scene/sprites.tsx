import type { PlayerVehicle, TopVehicleKind } from "@/lib/types";

/* =========================================================
 * Xe nhìn từ trên xuống (hướng mũi xe: +x), tâm tại gốc toạ độ.
 * ========================================================= */

const GLASS = "#1f2a3a";

export const TOP_LABEL: Record<TopVehicleKind, string> = {
  car: "Xe con",
  truck: "Xe tải",
  bus: "Xe khách",
  moto: "Xe mô tô",
  bike: "Xe đạp",
  ambulance: "Xe cứu thương",
  fire: "Xe cứu hoả",
  police: "Xe công an",
};

export const TOP_LENGTH: Record<TopVehicleKind, number> = {
  car: 40, truck: 56, bus: 64, moto: 26, bike: 22, ambulance: 46, fire: 58, police: 42,
};

function LightBar({ x, blink = true }: { x: number; blink?: boolean }) {
  return (
    <g>
      <rect x={x - 3} y={-7} width={6} height={14} rx={2} fill="#0f172a" />
      <rect x={x - 2.5} y={-6.5} width={5} height={6} rx={1.5} fill="#ef4444" className={blink ? "blink-a" : undefined} />
      <rect x={x - 2.5} y={0.5} width={5} height={6} rx={1.5} fill="#3b82f6" className={blink ? "blink-b" : undefined} />
    </g>
  );
}

function Blinker({ side, len, w }: { side: "left" | "right"; len: number; w: number }) {
  const y = side === "left" ? -w / 2 : w / 2;
  return (
    <g className="blinker" fill="#fbbf24">
      <circle cx={len / 2 - 2} cy={y} r={2.6} />
      <circle cx={-len / 2 + 2} cy={y} r={2.6} />
    </g>
  );
}

export function TopVehicle({
  kind,
  color,
  blink,
}: {
  kind: TopVehicleKind;
  color?: string;
  blink?: "left" | "right";
}) {
  switch (kind) {
    case "car":
    case "police": {
      const body = kind === "police" ? "#f8fafc" : color ?? "#3b82f6";
      return (
        <g>
          <rect x={-21} y={-11} width={42} height={22} rx={7} fill="#0006" transform="translate(2 2)" />
          <rect x={-21} y={-11} width={42} height={22} rx={7} fill={body} stroke="#0003" />
          <rect x={3} y={-9} width={8} height={18} rx={2} fill={GLASS} />
          <rect x={-15} y={-8.5} width={5} height={17} rx={2} fill={GLASS} />
          <rect x={-10} y={-8} width={13} height={16} rx={2} fill={body} opacity={0.85} />
          {kind === "police" && (
            <>
              <rect x={-21} y={-3} width={42} height={6} fill="#1d4ed8" opacity={0.9} />
              <LightBar x={-3} />
            </>
          )}
          <circle cx={19} cy={-7} r={1.8} fill="#fef9c3" />
          <circle cx={19} cy={7} r={1.8} fill="#fef9c3" />
          {blink && <Blinker side={blink} len={42} w={22} />}
        </g>
      );
    }
    case "truck":
      return (
        <g>
          <rect x={-28} y={-12} width={56} height={24} rx={3} fill="#0006" transform="translate(2 2)" />
          <rect x={-28} y={-12} width={42} height={24} rx={2} fill={color ?? "#e2e8f0"} stroke="#0003" />
          <path d="M-24 -8 H10 M-24 0 H10 M-24 8 H10" stroke="#0002" />
          <rect x={15} y={-11} width={13} height={22} rx={4} fill="#f97316" />
          <rect x={22} y={-9} width={5} height={18} rx={1.5} fill={GLASS} />
          {blink && <Blinker side={blink} len={56} w={24} />}
        </g>
      );
    case "bus":
      return (
        <g>
          <rect x={-32} y={-12} width={64} height={24} rx={5} fill="#0006" transform="translate(2 2)" />
          <rect x={-32} y={-12} width={64} height={24} rx={5} fill={color ?? "#facc15"} stroke="#0003" />
          <rect x={25} y={-10} width={5} height={20} rx={2} fill={GLASS} />
          <rect x={-27} y={-8} width={48} height={16} rx={3} fill="#fff" opacity={0.35} />
          <rect x={-20} y={-5} width={8} height={10} rx={1.5} fill="#64748b" opacity={0.5} />
          <rect x={0} y={-5} width={8} height={10} rx={1.5} fill="#64748b" opacity={0.5} />
          {blink && <Blinker side={blink} len={64} w={24} />}
        </g>
      );
    case "ambulance":
      return (
        <g>
          <rect x={-23} y={-11} width={46} height={22} rx={5} fill="#0006" transform="translate(2 2)" />
          <rect x={-23} y={-11} width={46} height={22} rx={5} fill="#fff" stroke="#0003" />
          <rect x={10} y={-9} width={7} height={18} rx={2} fill={GLASS} />
          <rect x={-23} y={-11} width={46} height={4} fill="#ef4444" />
          <rect x={-23} y={7} width={46} height={4} fill="#ef4444" />
          <path d="M-10 -6 V6 M-16 0 H-4" stroke="#ef4444" strokeWidth={4} />
          <LightBar x={4} />
          {blink && <Blinker side={blink} len={46} w={22} />}
        </g>
      );
    case "fire":
      return (
        <g>
          <rect x={-29} y={-12} width={58} height={24} rx={4} fill="#0006" transform="translate(2 2)" />
          <rect x={-29} y={-12} width={58} height={24} rx={4} fill="#dc2626" stroke="#0003" />
          <rect x={20} y={-10} width={6} height={20} rx={2} fill={GLASS} />
          <g stroke="#e5e7eb" strokeWidth={1.6}>
            <line x1={-25} y1={-4} x2={12} y2={-4} />
            <line x1={-25} y1={4} x2={12} y2={4} />
            {[-22, -16, -10, -4, 2, 8].map((x) => (
              <line key={x} x1={x} y1={-4} x2={x} y2={4} />
            ))}
          </g>
          <LightBar x={15} />
          {blink && <Blinker side={blink} len={58} w={24} />}
        </g>
      );
    case "moto":
      return (
        <g>
          <ellipse cx={1} cy={1} rx={13} ry={5} fill="#0005" />
          <rect x={-13} y={-3.5} width={26} height={7} rx={3.5} fill={color ?? "#111827"} />
          <line x1={7} y1={-7} x2={7} y2={7} stroke="#334155" strokeWidth={2.2} strokeLinecap="round" />
          <circle cx={-1} cy={0} r={6} fill="#ef4444" stroke="#7f1d1d" strokeWidth={1} />
          <circle cx={0.5} cy={0} r={2.4} fill="#1e293b" opacity={0.6} />
          {blink && <Blinker side={blink} len={26} w={10} />}
        </g>
      );
    case "bike":
      return (
        <g>
          <rect x={-11} y={-1.5} width={22} height={3} rx={1.5} fill="#334155" />
          <line x1={6} y1={-6} x2={6} y2={6} stroke="#334155" strokeWidth={2} />
          <circle cx={-1} cy={0} r={5} fill="#22c55e" />
        </g>
      );
  }
}

/* =========================================================
 * Xe người chơi nhìn từ phía sau (gốc: giữa mép dưới).
 * ========================================================= */

function Plate({ y, w = 46, text = "LÁI-LỤA" }: { y: number; w?: number; text?: string }) {
  return (
    <g>
      <rect x={-w / 2} y={y} width={w} height={13} rx={2} fill="#f8fafc" stroke="#0f172a" strokeWidth={1.2} />
      <text x={0} y={y + 10} textAnchor="middle" fontSize={9} fontWeight={800} fill="#0f172a" fontFamily="Arial">{text}</text>
    </g>
  );
}

function Tail({ x, y, on, w = 26, h = 10 }: { x: number; y: number; on: boolean; w?: number; h?: number }) {
  return (
    <g>
      {on && <ellipse cx={x + w / 2} cy={y + h / 2} rx={w} ry={h * 1.6} fill="#ef4444" opacity={0.35} />}
      <rect x={x} y={y} width={w} height={h} rx={3} fill={on ? "#ff2d2d" : "#991b1b"} />
    </g>
  );
}

function Rider({ y, shirt = "#2563eb", helmet = "#facc15" }: { y: number; shirt?: string; helmet?: string }) {
  return (
    <g>
      <path d={`M-24 ${y + 60} Q-26 ${y + 22} 0 ${y + 18} Q26 ${y + 22} 24 ${y + 60} Z`} fill={shirt} />
      <path d={`M-24 ${y + 40} L-40 ${y + 58} M24 ${y + 40} L40 ${y + 58}`} stroke={shirt} strokeWidth={10} strokeLinecap="round" />
      <ellipse cx={0} cy={y + 2} rx={19} ry={21} fill={helmet} />
      <path d={`M-19 ${y + 6} Q0 ${y + 16} 19 ${y + 6}`} stroke="#0003" strokeWidth={3} fill="none" />
    </g>
  );
}

export function RearVehicle({ kind, braking = false }: { kind: PlayerVehicle; braking?: boolean }) {
  switch (kind) {
    case "scooter":
    case "bigbike":
    case "trike": {
      const big = kind === "bigbike";
      return (
        <g>
          <ellipse cx={0} cy={-4} rx={kind === "trike" ? 70 : 44} ry={9} fill="#0005" />
          {kind === "trike" && (
            <>
              <rect x={-66} y={-40} width={20} height={38} rx={8} fill="#111" />
              <rect x={46} y={-40} width={20} height={38} rx={8} fill="#111" />
              <rect x={-56} y={-70} width={112} height={32} rx={8} fill="#0f766e" />
            </>
          )}
          <rect x={-11} y={-44} width={22} height={42} rx={9} fill="#111" />
          <path d={`M-${big ? 34 : 30} -58 Q0 -${big ? 92 : 84} ${big ? 34 : 30} -58 L${big ? 30 : 26} -40 L-${big ? 30 : 26} -40 Z`} fill={big ? "#dc2626" : "#e5e7eb"} />
          <Tail x={-12} y={-60} on={braking} w={24} h={8} />
          <Plate y={-46} w={34} text="29-LL" />
          <path d="M-58 -118 L58 -118" stroke="#1f2937" strokeWidth={6} strokeLinecap="round" />
          <circle cx={-60} cy={-118} r={5} fill="#94a3b8" />
          <circle cx={60} cy={-118} r={5} fill="#94a3b8" />
          <Rider y={-150} shirt={big ? "#111827" : "#2563eb"} helmet={big ? "#f97316" : "#facc15"} />
        </g>
      );
    }
    case "car":
      return (
        <g>
          <ellipse cx={0} cy={-3} rx={112} ry={12} fill="#0006" />
          <rect x={-100} y={-34} width={30} height={32} rx={8} fill="#111" />
          <rect x={70} y={-34} width={30} height={32} rx={8} fill="#111" />
          <path d="M-104 -30 L-104 -78 Q-100 -92 -86 -96 L86 -96 Q100 -92 104 -78 L104 -30 Q104 -22 96 -22 L-96 -22 Q-104 -22 -104 -30 Z" fill="#dc2626" />
          <path d="M-78 -96 L-62 -140 Q-58 -148 -48 -148 L48 -148 Q58 -148 62 -140 L78 -96 Z" fill="#b91c1c" />
          <path d="M-66 -100 L-54 -134 Q-51 -140 -44 -140 L44 -140 Q51 -140 54 -134 L66 -100 Z" fill="#1e293b" />
          <path d="M-60 -106 L-50 -130 L-20 -130 L-36 -106 Z" fill="#fff" opacity={0.12} />
          <Tail x={-98} y={-82} on={braking} w={34} h={14} />
          <Tail x={64} y={-82} on={braking} w={34} h={14} />
          <rect x={-104} y={-44} width={208} height={8} fill="#0002" />
          <Plate y={-66} w={56} />
          <rect x={-112} y={-100} width={14} height={9} rx={3} fill="#991b1b" />
          <rect x={98} y={-100} width={14} height={9} rx={3} fill="#991b1b" />
        </g>
      );
    case "pickup":
    case "truck":
    case "trailer": {
      const w = kind === "pickup" ? 104 : 122;
      const h = kind === "pickup" ? 150 : kind === "trailer" ? 190 : 176;
      const box = kind === "trailer" ? "#2563eb" : kind === "truck" ? "#f97316" : "#64748b";
      return (
        <g>
          <ellipse cx={0} cy={-3} rx={w + 12} ry={12} fill="#0006" />
          <rect x={-w + 6} y={-36} width={30} height={34} rx={6} fill="#111" />
          <rect x={w - 36} y={-36} width={30} height={34} rx={6} fill="#111" />
          <rect x={-w} y={-h} width={w * 2} height={h - 26} rx={6} fill={box} />
          <line x1={0} y1={-h + 8} x2={0} y2={-34} stroke="#0003" strokeWidth={3} />
          <g stroke="#0002" strokeWidth={4}>
            <line x1={-w + 20} y1={-h + 14} x2={-w + 20} y2={-34} />
            <line x1={w - 20} y1={-h + 14} x2={w - 20} y2={-34} />
          </g>
          {kind === "trailer" && (
            <text x={0} y={-h / 2 - 6} textAnchor="middle" fontSize={20} fontWeight={900} fill="#fff" opacity={0.8} fontFamily="Arial">CONTAINER</text>
          )}
          <rect x={-w} y={-34} width={w * 2} height={10} fill="#1f2937" />
          <Tail x={-w + 4} y={-52} on={braking} w={26} h={12} />
          <Tail x={w - 30} y={-52} on={braking} w={26} h={12} />
          <Plate y={-56} w={56} />
        </g>
      );
    }
    case "van":
    case "bus": {
      const w = kind === "van" ? 100 : 124;
      const h = kind === "van" ? 158 : 190;
      return (
        <g>
          <ellipse cx={0} cy={-3} rx={w + 12} ry={12} fill="#0006" />
          <rect x={-w + 6} y={-34} width={28} height={32} rx={6} fill="#111" />
          <rect x={w - 34} y={-34} width={28} height={32} rx={6} fill="#111" />
          <rect x={-w} y={-h} width={w * 2} height={h - 24} rx={16} fill={kind === "van" ? "#f8fafc" : "#facc15"} />
          <rect x={-w + 14} y={-h + 14} width={w * 2 - 28} height={h * 0.38} rx={8} fill="#1e293b" />
          <text x={0} y={-h * 0.36} textAnchor="middle" fontSize={16} fontWeight={900} fill={kind === "van" ? "#0f172a" : "#7c2d12"} fontFamily="Arial">{kind === "van" ? "DU LỊCH" : "XE KHÁCH"}</text>
          <Tail x={-w + 6} y={-68} on={braking} w={24} h={22} />
          <Tail x={w - 30} y={-68} on={braking} w={24} h={22} />
          <Plate y={-58} w={56} />
          <rect x={-w} y={-36} width={w * 2} height={10} rx={4} fill="#1f2937" />
        </g>
      );
    }
  }
}
