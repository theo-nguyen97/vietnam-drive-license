import type { SignCode } from "@/lib/types";
import type { ReactNode } from "react";

/* Bảng màu biển báo */
const RED = "#d7191f";
const YEL = "#ffcf1a";
const BLUE = "#1c5dbd";
const INK = "#111";
const W = "#fff";
const GRAY = "#8a8a8a";

/* ---------- Khung biển ---------- */
function Prohib({ children, bg = W, slash = false }: { children?: ReactNode; bg?: string; slash?: boolean }) {
  return (
    <>
      <circle cx={50} cy={50} r={47} fill={W} />
      <circle cx={50} cy={50} r={41.5} fill={bg} stroke={RED} strokeWidth={10} />
      {children}
      {slash && <line x1={22} y1={22} x2={78} y2={78} stroke={RED} strokeWidth={8} />}
    </>
  );
}

/* Biển hết cấm: viền đen, hình xám, gạch chéo đen */
function EndProhib({ children }: { children?: ReactNode }) {
  return (
    <>
      <circle cx={50} cy={50} r={46} fill={W} stroke={INK} strokeWidth={3} />
      {children}
      <line x1={22} y1={22} x2={78} y2={78} stroke={INK} strokeWidth={6} />
    </>
  );
}

function Warn({ children, inverted = false }: { children?: ReactNode; inverted?: boolean }) {
  const pts = inverted ? "8,14 92,14 50,90" : "50,8 93,86 7,86";
  return (
    <>
      <polygon points={pts} fill={YEL} stroke={RED} strokeWidth={8} strokeLinejoin="round" />
      {children}
    </>
  );
}

function Mand({ children }: { children?: ReactNode }) {
  return (
    <>
      <circle cx={50} cy={50} r={47} fill={BLUE} stroke={W} strokeWidth={2.5} />
      {children}
    </>
  );
}

function Info({ children }: { children?: ReactNode }) {
  return (
    <>
      <rect x={4} y={4} width={92} height={92} rx={8} fill={BLUE} />
      <rect x={9} y={9} width={82} height={82} rx={5} fill="none" stroke={W} strokeWidth={2.5} />
      {children}
    </>
  );
}

/* ---------- Hình vẽ ---------- */
function CarSide({ x, y, s = 1, fill = INK }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M2 20 L2 14 Q2 11 6 11 L14 10 L20 3 Q21 2 24 2 L42 2 Q45 2 47 5 L52 10 L57 11 Q60 12 60 15 L60 20 Z"
        fill={fill}
      />
      <circle cx={14} cy={21} r={5.5} fill={fill} stroke={W} strokeWidth={2} />
      <circle cx={47} cy={21} r={5.5} fill={fill} stroke={W} strokeWidth={2} />
    </g>
  );
}

function MotoSide({ x, y, s = 1, fill = INK }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={fill} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <circle cx={9} cy={24} r={7} strokeWidth={4} />
      <circle cx={47} cy={24} r={7} strokeWidth={4} />
      <path d="M9 24 L20 13 L36 13 L47 24" strokeWidth={4.5} />
      <path d="M36 13 L40 4 L45 4" strokeWidth={3.5} />
      <path d="M17 12 L30 12" strokeWidth={6} />
      <circle cx={26} cy={-7} r={4.5} fill={fill} stroke="none" />
      <path d="M25 -2 L22 10 M24 1 L37 6" strokeWidth={4} />
    </g>
  );
}

function TruckSide({ x, y, s = 1, fill = INK }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={0} y={0} width={40} height={22} fill={fill} rx={1.5} />
      <path d="M43 6 L53 6 L60 14 L60 22 L43 22 Z" fill={fill} />
      <circle cx={11} cy={24} r={5.5} fill={fill} stroke={W} strokeWidth={2} />
      <circle cx={50} cy={24} r={5.5} fill={fill} stroke={W} strokeWidth={2} />
    </g>
  );
}

function Walker({ x = 0, y = 0, s = 1, color = INK }: { x?: number; y?: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={7} strokeLinecap="round" fill="none">
      <circle cx={52} cy={22} r={7} fill={color} stroke="none" />
      <path d="M50 33 L46 55" />
      <path d="M49 36 L38 48 M49 36 L60 47" strokeWidth={5.5} />
      <path d="M46 55 L37 75 M46 55 L58 74" />
    </g>
  );
}

function Bicycle({ x, y, s = 1, color = W }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={10} cy={22} r={9} />
      <circle cx={50} cy={22} r={9} />
      <path d="M10 22 L22 6 L40 6 L50 22 M22 6 L30 22 L40 6 M30 22 L10 22" />
      <path d="M19 2 L26 2 M40 6 L38 0 L44 0" />
    </g>
  );
}

function ArrowUp({ color = W, scale = 1 }: { color?: string; scale?: number }) {
  return (
    <path
      transform={`translate(50 50) scale(${scale}) translate(-50 -50)`}
      d="M50 16 L72 42 L58 42 L58 84 L42 84 L42 42 L28 42 Z"
      fill={color}
    />
  );
}

function TurnRight({ color = INK, mirror = false }: { color?: string; mirror?: boolean }) {
  return (
    <g transform={mirror ? "translate(100 0) scale(-1 1)" : undefined}>
      <path d="M38 82 L38 52 Q38 40 50 40 L60 40" stroke={color} strokeWidth={13} fill="none" strokeLinejoin="round" />
      <polygon points="58,24 80,40 58,56" fill={color} />
    </g>
  );
}

function UTurn({ color = INK }: { color?: string }) {
  return (
    <g>
      <path d="M62 82 L62 44 Q62 26 46 26 Q32 26 32 44 L32 58" stroke={color} strokeWidth={11} fill="none" />
      <polygon points="18,56 46,56 32,76" fill={color} />
    </g>
  );
}

function Txt({ children, size = 34, color = INK, y = 62, weight = 800 }: { children: ReactNode; size?: number; color?: string; y?: number; weight?: number }) {
  return (
    <text x={50} y={y} textAnchor="middle" fontSize={size} fontWeight={weight} fill={color} fontFamily="Arial, Helvetica, sans-serif">
      {children}
    </text>
  );
}

function RoundaboutArrows({ color = W }: { color?: string }) {
  const arm = (rot: number) => (
    <g key={rot} transform={`rotate(${rot} 50 50)`}>
      <path d="M50 22 A28 28 0 0 1 74 36" stroke={color} strokeWidth={8} fill="none" />
      <polygon points="66,30 84,34 74,48" fill={color} />
    </g>
  );
  return <>{[0, 120, 240].map(arm)}</>;
}


function BusSide({ x, y, s = 1, fill = INK }: { x: number; y: number; s?: number; fill?: string }) {
  const win = fill === W ? BLUE : W;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={0} y={0} width={60} height={22} rx={4} fill={fill} />
      <g fill={win}>
        {[4, 15, 26, 37].map((wx) => (
          <rect key={wx} x={wx} y={4} width={8} height={7} />
        ))}
        <rect x={49} y={4} width={7} height={10} />
      </g>
      <circle cx={12} cy={23} r={5.5} fill={fill} stroke={W} strokeWidth={2} />
      <circle cx={48} cy={23} r={5.5} fill={fill} stroke={W} strokeWidth={2} />
    </g>
  );
}

/* Xe gắn máy (không có người lái, nhỏ hơn mô tô) */
function Moped({ x, y, s = 1, fill = INK }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={fill} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <circle cx={9} cy={24} r={7} strokeWidth={4} />
      <circle cx={47} cy={24} r={7} strokeWidth={4} />
      <path d="M9 24 L17 12 L34 12 L47 24" strokeWidth={4.5} />
      <path d="M34 12 L38 2 L44 2" strokeWidth={3.5} />
      <path d="M14 10 L27 10" strokeWidth={6} />
      <path d="M22 24 L34 24" strokeWidth={4} />
    </g>
  );
}

/* Ô tô nhìn từ phía trước (P.125, P.126, P.133) */
function CarFront({ x, y, fill = INK }: { x: number; y: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M2 30 L2 12 Q3 4 10 4 L20 4 Q27 4 28 12 L28 30 Z" fill={fill} />
      <rect x={0} y={28} width={7} height={6} fill={fill} />
      <rect x={23} y={28} width={7} height={6} fill={fill} />
    </g>
  );
}

function TruckFront({ x, y, fill = INK }: { x: number; y: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={1} y={0} width={28} height={30} rx={2} fill={fill} />
      <rect x={4} y={4} width={22} height={9} fill={W} />
      <rect x={0} y={28} width={7} height={6} fill={fill} />
      <rect x={23} y={28} width={7} height={6} fill={fill} />
    </g>
  );
}

/* Mũi tên thẳng + rẽ phải (mirror = rẽ trái) */
function ArrowStraightTurn({ color = INK, mirror = false }: { color?: string; mirror?: boolean }) {
  return (
    <g transform={mirror ? "translate(100 0) scale(-1 1)" : undefined}>
      <path d="M42 84 L42 32" stroke={color} strokeWidth={12} fill="none" />
      <polygon points="26,36 42,14 58,36" fill={color} />
      <path d="M42 62 L66 62" stroke={color} strokeWidth={11} fill="none" />
      <polygon points="64,48 82,62 64,76" fill={color} />
    </g>
  );
}

/* Mũi tên rẽ trái + rẽ phải */
function ArrowLeftRight({ color = INK }: { color?: string }) {
  return (
    <g fill={color}>
      <path d="M50 82 L50 44 M28 44 L72 44" stroke={color} strokeWidth={11} fill="none" />
      <polygon points="30,30 14,44 30,58" />
      <polygon points="70,30 86,44 70,58" />
    </g>
  );
}

/* Hai mũi tên ngược chiều qua đường hẹp (P.132, I.406) */
function NarrowArrows({ up, down, big = "up" }: { up: string; down: string; big?: "up" | "down" }) {
  const upS = big === "up" ? 1 : 0.72;
  const downS = big === "down" ? 1 : 0.72;
  return (
    <>
      <g transform={`translate(38 50) scale(${upS}) translate(-38 -50)`}>
        <path d="M38 20 L52 38 L44 38 L44 80 L32 80 L32 38 L24 38 Z" fill={up} />
      </g>
      <g transform={`translate(62 50) scale(${downS}) translate(-62 -50)`}>
        <path d="M62 80 L76 62 L68 62 L68 20 L56 20 L56 62 L48 62 Z" fill={down} />
      </g>
    </>
  );
}

/* Biểu tượng đường cao tốc (hai làn + cầu vượt) trong khung 40x40 */
function HighwayIcon({ x, y, s = 1, color = W }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={3.5} strokeLinecap="round" fill="none">
      <path d="M4 40 L12 4 M15 40 L18 4 M25 40 L22 4 M36 40 L28 4" />
      <rect x={2} y={17} width={36} height={5} fill={color} stroke="none" />
    </g>
  );
}

/* Cụm nhà (khu đông dân cư) */
function Town({ color = W }: { color?: string }) {
  return (
    <g fill={color}>
      <rect x={20} y={48} width={14} height={30} />
      <polygon points="38,38 49,24 60,38" />
      <rect x={38} y={38} width={22} height={40} />
      <rect x={64} y={44} width={16} height={34} />
      <g fill={BLUE}>
        <rect x={24} y={54} width={6} height={6} />
        <rect x={24} y={66} width={6} height={6} />
        <rect x={43} y={46} width={5} height={6} />
        <rect x={51} y={46} width={5} height={6} />
        <rect x={43} y={60} width={5} height={6} />
        <rect x={51} y={60} width={5} height={6} />
        <rect x={69} y={50} width={6} height={6} />
        <rect x={69} y={64} width={6} height={6} />
      </g>
    </g>
  );
}

/* ---------- Biển ---------- */
export function SignGraphic({ code, value }: { code: SignCode; value?: string | number }) {
  switch (code) {
    case "P.101":
      return <Prohib />;
    case "P.102":
      return (
        <>
          <circle cx={50} cy={50} r={47} fill={RED} stroke={W} strokeWidth={2} />
          <rect x={17} y={41} width={66} height={18} fill={W} />
        </>
      );
    case "P.103a":
      return <Prohib slash><CarSide x={19} y={37} /></Prohib>;
    case "P.104":
      return <Prohib slash><MotoSide x={22} y={40} /></Prohib>;
    case "P.105":
      return (
        <Prohib slash>
          <CarSide x={24} y={22} s={0.85} />
          <MotoSide x={28} y={58} s={0.75} />
        </Prohib>
      );
    case "P.106a":
      return <Prohib slash><TruckSide x={20} y={36} /></Prohib>;
    case "P.112":
      return <Prohib slash><Walker x={2} y={4} s={0.92} /></Prohib>;
    case "P.115":
      return <Prohib><Txt size={30} y={61}>{value ?? "10t"}</Txt></Prohib>;
    case "P.117":
      return (
        <Prohib>
          <polygon points="42,18 58,18 50,28" fill={INK} />
          <polygon points="42,82 58,82 50,72" fill={INK} />
          <Txt size={24} y={59}>{value ?? "3.5m"}</Txt>
        </Prohib>
      );
    case "P.123a":
      return <Prohib slash><TurnRight mirror /></Prohib>;
    case "P.123b":
      return <Prohib slash><TurnRight /></Prohib>;
    case "P.124a":
      return <Prohib slash><UTurn /></Prohib>;
    case "P.125":
      return (
        <Prohib>
          <CarFront x={20} y={34} fill={RED} />
          <CarFront x={52} y={34} />
        </Prohib>
      );
    case "P.127":
      return <Prohib><Txt size={38} y={63}>{value ?? 50}</Txt></Prohib>;
    case "P.128":
      return (
        <Prohib slash>
          <path d="M26 43 L42 43 L66 28 L66 72 L42 57 L26 57 Z" fill={INK} />
        </Prohib>
      );
    case "P.130":
      return (
        <Prohib bg={BLUE}>
          <line x1={22} y1={22} x2={78} y2={78} stroke={RED} strokeWidth={8} />
          <line x1={78} y1={22} x2={22} y2={78} stroke={RED} strokeWidth={8} />
        </Prohib>
      );
    case "P.131a":
      return <Prohib bg={BLUE} slash />;
    case "P.103b":
      return (
        <Prohib slash>
          <CarSide x={16} y={22} s={0.72} />
          <g transform="translate(38 40) scale(0.5)">
            <TurnRight />
          </g>
        </Prohib>
      );
    case "P.103c":
      return (
        <Prohib slash>
          <CarSide x={40} y={22} s={0.72} />
          <g transform="translate(8 40) scale(0.5)">
            <TurnRight mirror />
          </g>
        </Prohib>
      );
    case "P.107":
      return (
        <Prohib slash>
          <BusSide x={22} y={20} s={0.78} />
          <TruckSide x={22} y={50} s={0.78} />
        </Prohib>
      );
    case "P.107a":
      return <Prohib slash><BusSide x={20} y={37} /></Prohib>;
    case "P.108":
      return (
        <Prohib slash>
          <CarSide x={12} y={40} s={0.62} />
          <path d="M49 54 L56 54" stroke={INK} strokeWidth={3} />
          <rect x={56} y={40} width={28} height={15} fill={INK} rx={1.5} />
          <circle cx={70} cy={58} r={4.5} fill={INK} stroke={W} strokeWidth={2} />
        </Prohib>
      );
    case "P.110a":
      return <Prohib slash><Bicycle x={20} y={36} color={INK} /></Prohib>;
    case "P.111a":
      return <Prohib slash><Moped x={22} y={40} /></Prohib>;
    case "P.116":
      return (
        <Prohib>
          <g fill={INK}>
            <rect x={22} y={24} width={10} height={18} rx={2} />
            <rect x={68} y={24} width={10} height={18} rx={2} />
            <rect x={32} y={31} width={36} height={4} />
          </g>
          <Txt size={27} y={75}>{value ?? "7T"}</Txt>
        </Prohib>
      );
    case "P.118":
      return (
        <Prohib>
          <polygon points="17,50 27,42 27,58" fill={INK} />
          <polygon points="83,50 73,42 73,58" fill={INK} />
          <Txt size={19} y={57}>{value ?? "2.2m"}</Txt>
        </Prohib>
      );
    case "P.119":
      return (
        <Prohib>
          <TruckSide x={33} y={20} s={0.55} />
          <Txt size={22} y={62}>{value ?? "10m"}</Txt>
          <path d="M26 74 L74 74" stroke={INK} strokeWidth={3} />
          <polygon points="18,74 27,68 27,80" fill={INK} />
          <polygon points="82,74 73,68 73,80" fill={INK} />
        </Prohib>
      );
    case "P.121":
      return (
        <Prohib>
          <CarSide x={14} y={28} s={0.5} />
          <CarSide x={56} y={28} s={0.5} />
          <Txt size={22} y={74}>{value ?? "70m"}</Txt>
        </Prohib>
      );
    case "P.124b":
      return (
        <Prohib slash>
          <CarSide x={18} y={21} s={0.5} />
          <g transform="translate(32 28) scale(0.58)">
            <UTurn />
          </g>
        </Prohib>
      );
    case "P.124c":
      return (
        <Prohib slash>
          <g transform="translate(4 24) scale(0.6)">
            <TurnRight mirror />
          </g>
          <g transform="translate(44 24) scale(0.6)">
            <UTurn />
          </g>
        </Prohib>
      );
    case "P.126":
      return (
        <Prohib>
          <TruckFront x={20} y={32} />
          <CarFront x={52} y={34} fill={RED} />
        </Prohib>
      );
    case "P.129":
      return (
        <Prohib>
          <rect x={30} y={24} width={40} height={6} fill={INK} />
          <Txt size={17} y={53} weight={900}>KIỂM</Txt>
          <Txt size={17} y={72} weight={900}>TRA</Txt>
        </Prohib>
      );
    case "P.132":
      return (
        <Prohib>
          <NarrowArrows up={RED} down={INK} big="down" />
        </Prohib>
      );
    case "P.133":
      return (
        <EndProhib>
          <CarFront x={20} y={34} fill={GRAY} />
          <CarFront x={52} y={34} fill={GRAY} />
        </EndProhib>
      );
    case "P.134":
      return (
        <EndProhib>
          <Txt size={38} y={63} color={GRAY}>{value ?? 50}</Txt>
        </EndProhib>
      );
    case "P.136":
      return <Prohib slash><ArrowUp color={INK} scale={0.8} /></Prohib>;
    case "P.137":
      return <Prohib slash><ArrowLeftRight /></Prohib>;
    case "P.138":
      return <Prohib slash><ArrowStraightTurn mirror /></Prohib>;
    case "P.139":
      return <Prohib slash><ArrowStraightTurn /></Prohib>;
    case "DP.135":
      return (
        <>
          <circle cx={50} cy={50} r={46} fill={W} stroke={INK} strokeWidth={2.5} />
          <clipPath id="dp135">
            <circle cx={50} cy={50} r={44} />
          </clipPath>
          <g clipPath="url(#dp135)" stroke="#555" strokeWidth={4}>
            {[-24, -12, 0, 12, 24].map((o) => (
              <line key={o} x1={10 + o} y1={10 - o} x2={90 + o} y2={90 - o} />
            ))}
          </g>
        </>
      );

    case "W.201a":
    case "W.201b":
      return (
        <Warn>
          <g transform={code === "W.201b" ? "translate(100 0) scale(-1 1)" : undefined}>
            <path d="M57 80 L57 60 Q57 42 38 40" stroke={INK} strokeWidth={9} fill="none" />
          </g>
        </Warn>
      );
    case "W.205a":
      return (
        <Warn>
          <path d="M50 32 L50 80 M30 58 L70 58" stroke={INK} strokeWidth={9} />
        </Warn>
      );
    case "W.207a":
      return (
        <Warn>
          <path d="M50 30 L50 80" stroke={INK} strokeWidth={11} />
          <path d="M31 60 L69 60" stroke={INK} strokeWidth={5} />
        </Warn>
      );
    case "W.208":
      return <Warn inverted />;
    case "W.209":
      return (
        <Warn>
          <rect x={41} y={34} width={18} height={44} rx={4} fill={INK} />
          <circle cx={50} cy={43} r={5} fill={RED} />
          <circle cx={50} cy={56} r={5} fill="#f5b400" />
          <circle cx={50} cy={69} r={5} fill="#16a34a" />
        </Warn>
      );
    case "W.210":
      return (
        <Warn>
          <g fill={INK}>
            <rect x={24} y={52} width={52} height={6} />
            <rect x={24} y={66} width={52} height={6} />
            {[28, 40, 52, 64].map((x) => (
              <rect key={x} x={x} y={46} width={6} height={32} />
            ))}
          </g>
        </Warn>
      );
    case "W.211a":
      return (
        <Warn>
          <g fill={INK}>
            <rect x={24} y={52} width={30} height={20} rx={2} />
            <rect x={52} y={42} width={20} height={30} rx={2} />
            <rect x={29} y={42} width={7} height={11} />
            <rect x={56} y={46} width={12} height={9} fill={YEL} />
            <circle cx={33} cy={75} r={5} />
            <circle cx={47} cy={75} r={5} />
            <circle cx={63} cy={75} r={5} />
          </g>
        </Warn>
      );
    case "W.219":
      return (
        <Warn>
          <polygon points="24,78 76,78 24,50" fill={INK} />
          <text x={60} y={60} fontSize={14} fontWeight={800} fill={INK} textAnchor="middle" fontFamily="Arial">10%</text>
        </Warn>
      );
    case "W.224":
      return (
        <Warn>
          <g fill={INK}>
            {[30, 42, 54, 66].map((x) => (
              <rect key={x} x={x - 3} y={76} width={7} height={5} />
            ))}
          </g>
          <Walker x={17} y={28} s={0.62} />
        </Warn>
      );
    case "W.225":
      return (
        <Warn>
          <Walker x={6} y={31} s={0.55} />
          <Walker x={30} y={40} s={0.45} />
        </Warn>
      );
    case "W.227":
      return (
        <Warn>
          <Walker x={10} y={30} s={0.55} />
          <path d="M46 52 L64 76" stroke={INK} strokeWidth={4} />
          <path d="M54 80 Q66 62 78 80 Z" fill={INK} />
        </Warn>
      );
    case "W.233":
      return (
        <Warn>
          <rect x={45} y={34} width={10} height={30} rx={3} fill={INK} />
          <circle cx={50} cy={73} r={6} fill={INK} />
        </Warn>
      );
    case "W.245a":
      return (
        <Warn>
          <Txt size={15} y={62} weight={900}>ĐI</Txt>
          <Txt size={15} y={78} weight={900}>CHẬM</Txt>
        </Warn>
      );

    case "W.202a":
      return (
        <Warn>
          <path d="M56 82 L56 70 Q56 60 47 60 L42 60 Q36 60 36 52 Q36 44 44 44 L52 44" stroke={INK} strokeWidth={9} fill="none" />
        </Warn>
      );
    case "W.203a":
      return (
        <Warn>
          <path d="M34 82 L34 62 Q34 52 42 48 L42 34 M66 82 L66 62 Q66 52 58 48 L58 34" stroke={INK} strokeWidth={7} fill="none" />
        </Warn>
      );
    case "W.204":
      return (
        <Warn>
          <g fill={INK}>
            <path d="M40 36 L50 50 L44 50 L44 82 L36 82 L36 50 L30 50 Z" />
            <path d="M60 82 L70 68 L64 68 L64 36 L56 36 L56 68 L50 68 Z" />
          </g>
        </Warn>
      );
    case "W.206":
      return (
        <Warn>
          <g transform="translate(50 58) scale(0.62) translate(-50 -50)">
            <RoundaboutArrows color={INK} />
          </g>
        </Warn>
      );
    case "W.212":
      return (
        <Warn>
          <path d="M30 82 L30 68 L40 60 L40 42 M70 82 L70 68 L60 60 L60 42" stroke={INK} strokeWidth={6} fill="none" />
          <rect x={34} y={40} width={7} height={20} fill={INK} />
          <rect x={59} y={40} width={7} height={20} fill={INK} />
        </Warn>
      );
    case "W.215a":
      return (
        <Warn>
          <path d="M18 70 L54 70 L54 84" stroke={INK} strokeWidth={5} fill="none" />
          <g transform="rotate(22 54 70)">
            <CarSide x={28} y={57} s={0.5} />
          </g>
          <path d="M60 80 Q64 76 68 80 T76 80 T84 80" stroke={INK} strokeWidth={3} fill="none" />
        </Warn>
      );
    case "W.217":
      return (
        <Warn>
          <path d="M18 70 L26 82 L74 82 L82 70 Z" fill={INK} />
          <CarSide x={33} y={54} s={0.55} />
        </Warn>
      );
    case "W.220":
      return (
        <Warn>
          <polygon points="24,78 76,78 76,50" fill={INK} />
          <text x={40} y={60} fontSize={14} fontWeight={800} fill={INK} textAnchor="middle" fontFamily="Arial">{value ?? "10%"}</text>
        </Warn>
      );
    case "W.221a":
      return (
        <Warn>
          <path d="M22 78 Q29 62 36 78 T50 78 T64 78 T78 78" stroke={INK} strokeWidth={6} fill="none" />
        </Warn>
      );
    case "W.222a":
      return (
        <Warn>
          <g transform="rotate(-14 48 44)">
            <CarSide x={30} y={34} s={0.6} />
          </g>
          <path d="M30 62 Q36 68 42 62 T54 62 T66 62 M34 72 Q40 78 46 72 T58 72 T70 72" stroke={INK} strokeWidth={3} fill="none" />
        </Warn>
      );
    case "W.226":
      return <Warn><Bicycle x={22} y={44} s={0.9} color={INK} /></Warn>;
    case "W.228a":
      return (
        <Warn>
          <g fill={INK}>
            <polygon points="16,82 34,82 36,64 40,52 34,52 30,62 24,72" />
            <polygon points="48,58 56,54 60,62 52,66" />
            <polygon points="58,70 66,66 70,74 62,78" />
            <polygon points="44,76 50,72 54,80 46,82" />
          </g>
        </Warn>
      );
    case "W.230":
      return (
        <Warn>
          <g fill={INK}>
            <ellipse cx={46} cy={62} rx={17} ry={9} />
            <circle cx={66} cy={57} r={6} />
            {[34, 40, 52, 58].map((x) => (
              <rect key={x} x={x} y={68} width={4} height={12} />
            ))}
          </g>
          <path d="M62 51 L60 46 M70 51 L72 46 M29 58 L24 68" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </Warn>
      );
    case "W.231":
      return (
        <Warn>
          <g fill={INK}>
            <ellipse cx={42} cy={64} rx={15} ry={8} />
            <circle cx={60} cy={50} r={5} />
            {[31, 37, 46, 52].map((x) => (
              <rect key={x} x={x} y={70} width={3} height={12} />
            ))}
          </g>
          <path d="M52 60 L59 52" stroke={INK} strokeWidth={6} strokeLinecap="round" />
          <path d="M58 45 L54 36 M58 45 L63 36 M56 40 L52 39 M60 40 L65 39 M28 60 L24 64" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </Warn>
      );
    case "W.232":
      return (
        <Warn>
          <rect x={36} y={44} width={4} height={38} fill={INK} />
          <path d="M40 46 Q54 42 68 50 Q54 58 40 62 Z" fill={INK} />
        </Warn>
      );
    case "W.235":
      return (
        <Warn>
          <rect x={47} y={42} width={6} height={40} fill={INK} />
          <path d="M36 52 L36 80" stroke={INK} strokeWidth={6} />
          <polygon points="36,42 30,52 42,52" fill={INK} />
          <path d="M64 42 L64 72" stroke={INK} strokeWidth={6} />
          <polygon points="64,82 58,72 70,72" fill={INK} />
        </Warn>
      );
    case "W.236":
      return (
        <Warn>
          <rect x={47} y={62} width={6} height={20} fill={INK} />
          <path d="M34 82 L34 64 Q34 54 42 50 L42 36 M66 82 L66 64 Q66 54 58 50 L58 36" stroke={INK} strokeWidth={6} fill="none" />
        </Warn>
      );
    case "W.238":
      return <Warn><HighwayIcon x={31} y={44} s={0.95} color={INK} /></Warn>;
    case "W.240":
      return (
        <Warn>
          <path d="M26 82 L26 56 Q26 36 50 36 Q74 36 74 56 L74 82 Z" fill={INK} />
          <path d="M36 82 L36 60 Q36 48 50 48 Q64 48 64 60 L64 82 Z" fill={YEL} />
        </Warn>
      );
    case "W.241":
      return (
        <Warn>
          <CarSide x={38} y={38} s={0.4} />
          <CarSide x={35} y={52} s={0.5} />
          <CarSide x={32} y={67} s={0.6} />
        </Warn>
      );
    case "W.242a":
      return (
        <Warn>
          <path d="M34 78 L66 42 M66 78 L34 42" stroke={INK} strokeWidth={9} strokeLinecap="round" />
        </Warn>
      );
    case "W.244":
      return (
        <Warn>
          <CarSide x={24} y={56} s={0.5} />
          <g transform="translate(100 0) scale(-1 1)">
            <CarSide x={24} y={56} s={0.5} />
          </g>
          <polygon points="50,32 53,41 62,39 56,46 63,51 54,51 50,60 46,51 37,51 44,46 38,39 47,41" fill={INK} />
        </Warn>
      );
    case "W.246a":
      return (
        <Warn>
          <rect x={45} y={44} width={10} height={16} fill={INK} />
          <path d="M50 82 L50 68 M50 68 Q50 60 40 56 L38 52 M50 68 Q50 60 60 56 L62 52" stroke={INK} strokeWidth={6} fill="none" />
          <polygon points="38,42 32,52 44,52" fill={INK} />
          <polygon points="62,42 56,52 68,52" fill={INK} />
        </Warn>
      );

    case "R.122":
      return (
        <>
          <polygon
            points="30,3 70,3 97,30 97,70 70,97 30,97 3,70 3,30"
            fill={RED}
            stroke={W}
            strokeWidth={3}
          />
          <Txt size={27} y={60} color={W} weight={900}>STOP</Txt>
        </>
      );
    case "R.301a":
      return <Mand><ArrowUp /></Mand>;
    case "R.301b":
      return <Mand><TurnRight color={W} /></Mand>;
    case "R.301c":
      return <Mand><TurnRight color={W} mirror /></Mand>;
    case "R.302a":
      return (
        <Mand>
          <g transform="rotate(135 50 50)">
            <ArrowUp scale={0.9} />
          </g>
        </Mand>
      );
    case "R.303":
      return <Mand><RoundaboutArrows /></Mand>;
    case "R.304":
      return <Mand><Bicycle x={20} y={36} /></Mand>;
    case "R.305":
      return <Mand><Walker x={-2} y={2} s={0.98} color={W} /></Mand>;
    case "R.306":
      return (
        <Mand>
          <Txt size={38} y={63} color={W}>{value ?? 30}</Txt>
        </Mand>
      );

    case "I.401":
    case "I.402":
      return (
        <>
          <polygon points="50,3 97,50 50,97 3,50" fill={W} stroke="#333" strokeWidth={2} />
          <polygon points="50,17 83,50 50,83 17,50" fill={YEL} />
          {code === "I.402" && (
            <g stroke={INK} strokeWidth={3.5}>
              <line x1={30} y1={24} x2={76} y2={70} />
              <line x1={24} y1={30} x2={70} y2={76} />
              <line x1={36} y1={18} x2={82} y2={64} />
            </g>
          )}
        </>
      );
    case "I.407a":
      return <Info><ArrowUp scale={0.9} /></Info>;
    case "I.408":
      return <Info><Txt size={60} y={72} color={W} weight={900}>P</Txt></Info>;
    case "I.409":
      return (
        <Info>
          <g transform="translate(100 0) scale(-1 1)">
            <UTurn color={W} />
          </g>
        </Info>
      );
    case "I.423":
      return (
        <Info>
          <polygon points="50,14 86,82 14,82" fill={W} />
          <g fill={INK}>
            {[30, 42, 54, 66].map((x) => (
              <rect key={x} x={x - 3} y={74} width={7} height={5} />
            ))}
          </g>
          <Walker x={22} y={30} s={0.55} />
        </Info>
      );
    case "I.434a":
      return (
        <Info>
          <g transform="translate(22 30)">
            <rect x={0} y={0} width={56} height={34} rx={5} fill={W} />
            <rect x={5} y={5} width={46} height={12} fill={BLUE} />
            <circle cx={12} cy={36} r={5} fill={W} stroke={BLUE} strokeWidth={2} />
            <circle cx={44} cy={36} r={5} fill={W} stroke={BLUE} strokeWidth={2} />
          </g>
        </Info>
      );
    case "R.301f":
      return <Mand><ArrowStraightTurn color={W} /></Mand>;
    case "R.301h":
      return <Mand><ArrowStraightTurn color={W} mirror /></Mand>;
    case "R.302b":
      return (
        <Mand>
          <g transform="rotate(-135 50 50)">
            <ArrowUp scale={0.9} />
          </g>
        </Mand>
      );
    case "R.307":
      return (
        <Mand>
          <Txt size={38} y={63} color={W}>{value ?? 30}</Txt>
          <line x1={22} y1={22} x2={78} y2={78} stroke={RED} strokeWidth={8} />
        </Mand>
      );
    case "R.309":
      return (
        <Mand>
          <path d="M22 43 L38 43 L60 28 L60 72 L38 57 L22 57 Z" fill={W} />
          <path d="M66 40 Q74 50 66 60 M73 33 Q85 50 73 67" stroke={W} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </Mand>
      );
    case "R.403a":
      return <Mand><CarSide x={19} y={37} fill={W} /></Mand>;
    case "R.403b":
      return (
        <Mand>
          <CarSide x={24} y={22} s={0.85} fill={W} />
          <MotoSide x={28} y={58} s={0.75} fill={W} />
        </Mand>
      );
    case "R.404a":
      return (
        <Mand>
          <CarSide x={19} y={37} fill={W} />
          <line x1={22} y1={22} x2={78} y2={78} stroke={RED} strokeWidth={8} />
        </Mand>
      );
    case "R.412a":
      return (
        <Info>
          <BusSide x={20} y={26} fill={W} />
          <polygon points="50,84 40,70 46,70 46,60 54,60 54,70 60,70" fill={W} />
        </Info>
      );

    case "I.405a":
      return (
        <Info>
          <rect x={45} y={36} width={10} height={46} fill={W} />
          <rect x={30} y={26} width={40} height={10} fill={RED} />
        </Info>
      );
    case "I.406":
      return (
        <Info>
          <NarrowArrows up={W} down={RED} big="up" />
        </Info>
      );
    case "I.410":
      return (
        <Info>
          <g transform="translate(100 0) scale(-1 1)">
            <g transform="translate(8 -2) scale(0.72)">
              <UTurn color={W} />
            </g>
          </g>
          <CarSide x={35} y={62} s={0.5} fill={W} />
        </Info>
      );
    case "I.420":
      return <Info><Town /></Info>;
    case "I.421":
      return (
        <Info>
          <Town />
          <line x1={20} y1={20} x2={80} y2={80} stroke={RED} strokeWidth={7} />
        </Info>
      );
    case "I.424a":
      return (
        <Info>
          <path d="M14 78 Q50 40 86 78" stroke={W} strokeWidth={5} fill="none" />
          <path d="M22 72 L22 84 M78 72 L78 84" stroke={W} strokeWidth={4} />
          <Walker x={23} y={14} s={0.55} color={W} />
        </Info>
      );
    case "I.425":
      return (
        <Info>
          <g fill={W}>
            <rect x={54} y={20} width={8} height={26} />
            <rect x={45} y={29} width={26} height={8} />
            <rect x={22} y={58} width={56} height={10} rx={2} />
            <rect x={22} y={46} width={6} height={22} />
            <rect x={30} y={52} width={12} height={6} rx={2} />
            <rect x={24} y={68} width={4} height={8} />
            <rect x={72} y={68} width={4} height={8} />
          </g>
        </Info>
      );
    case "I.426":
      return (
        <Info>
          <rect x={26} y={26} width={48} height={48} rx={3} fill={W} />
          <rect x={45} y={32} width={10} height={36} fill={RED} />
          <rect x={32} y={45} width={36} height={10} fill={RED} />
        </Info>
      );
    case "I.428":
      return (
        <Info>
          <rect x={26} y={80} width={40} height={6} fill={W} />
          <rect x={30} y={24} width={30} height={56} rx={3} fill={W} />
          <rect x={35} y={30} width={20} height={14} fill={BLUE} />
          <path d="M60 40 L70 40 L70 70" stroke={W} strokeWidth={4} fill="none" />
          <rect x={65} y={68} width={10} height={9} rx={1.5} fill={W} />
        </Info>
      );
    case "I.436":
      return (
        <Info>
          <polygon points="50,18 66,24 64,42 50,52 36,42 34,24" fill={W} />
          <polygon points="50,26 52.4,32 58.5,32 53.6,35.8 55.4,42 50,38.2 44.6,42 46.4,35.8 41.5,32 47.6,32" fill={BLUE} />
          <Txt size={20} y={77} color={W} weight={900}>CSGT</Txt>
        </Info>
      );
    case "I.437":
      return <Info><HighwayIcon x={22} y={22} s={1.4} /></Info>;
    case "I.438":
      return (
        <Info>
          <HighwayIcon x={22} y={22} s={1.4} />
          <line x1={20} y1={20} x2={80} y2={80} stroke={RED} strokeWidth={7} />
        </Info>
      );
    default:
      return <Warn />;
  }
}
