import type { SignCode } from "@/lib/types";
import type { ReactNode } from "react";

/* Bảng màu biển báo */
const RED = "#d7191f";
const YEL = "#ffcf1a";
const BLUE = "#1c5dbd";
const INK = "#111";
const W = "#fff";

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

function RoundaboutArrows() {
  const arm = (rot: number) => (
    <g key={rot} transform={`rotate(${rot} 50 50)`}>
      <path d="M50 22 A28 28 0 0 1 74 36" stroke={W} strokeWidth={8} fill="none" />
      <polygon points="66,30 84,34 74,48" fill={W} />
    </g>
  );
  return <>{[0, 120, 240].map(arm)}</>;
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
          <g transform="translate(20 34)">
            <path d="M2 30 L2 12 Q3 4 10 4 L20 4 Q27 4 28 12 L28 30 Z" fill={RED} />
            <rect x={0} y={28} width={7} height={6} fill={RED} />
            <rect x={23} y={28} width={7} height={6} fill={RED} />
          </g>
          <g transform="translate(52 34)">
            <path d="M2 30 L2 12 Q3 4 10 4 L20 4 Q27 4 28 12 L28 30 Z" fill={INK} />
            <rect x={0} y={28} width={7} height={6} fill={INK} />
            <rect x={23} y={28} width={7} height={6} fill={INK} />
          </g>
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
    default:
      return <Warn />;
  }
}
