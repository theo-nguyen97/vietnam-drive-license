"use client";

import { useEffect, useRef, useState } from "react";
import type { ConsequenceKind, PlayerVehicle, RoadProp, SignCode } from "@/lib/types";
import { SignGraphic } from "@/components/signs/SignGraphic";
import { RearVehicle } from "./sprites";
import { rng } from "@/lib/random";

export type DrivePhase = "intro" | "idle" | "pass" | "fail";
type Scenery = "city" | "country" | "coast" | "mountain";

/* Khung hình và phép chiếu phối cảnh */
const VW = 640;
const VH = 360;
const HZ = 150;
const F = 210;
const CAMX = 1.1;
const GATE = 24;
const STOP = 20.4;

function P(X: number, h: number, z: number) {
  const s = F / z;
  return { x: VW / 2 + (X - CAMX) * s, y: HZ + (1 - h) * s, s };
}

function quad(X1: number, X2: number, z1: number, z2: number, h = 0) {
  const a = P(X1, h, z1);
  const b = P(X2, h, z1);
  const c = P(X2, h, z2);
  const d = P(X1, h, z2);
  return `${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y} ${d.x},${d.y}`;
}

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeIn = (x: number) => x * x;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

const SCENERY: Scenery[] = ["city", "country", "coast", "mountain"];

const GROUND: Record<Scenery, string> = {
  city: "#9ca3af",
  country: "#65a30d",
  coast: "#e9d8a6",
  mountain: "#4d7c0f",
};

export function DriveScene({
  vehicle,
  props = [],
  signs = [],
  phase,
  runKey,
  label,
  seed = 1,
  consequence,
  onIntroDone,
}: {
  vehicle: PlayerVehicle;
  props?: RoadProp[];
  signs?: SignCode[];
  phase: DrivePhase;
  runKey: string | number;
  label?: string;
  seed?: number;
  /** Loại hậu quả khi phase = "fail": va chạm, bị phạt, mất an toàn. */
  consequence?: ConsequenceKind;
  onIntroDone?: () => void;
}) {
  const [snap, setSnap] = useState({ d: 0, t: 0, boom: 0, shake: 0 });
  const st = useRef({ d: 0, t: 0, boom: 0, shake: 0, phase0: 0, dFrom: 0, introDone: false });
  const phaseRef = useRef(phase);
  const consRef = useRef(consequence);
  const cb = useRef(onIntroDone);

  useEffect(() => {
    consRef.current = consequence;
  }, [consequence]);
  const reduced = useRef(false);

  useEffect(() => {
    cb.current = onIntroDone;
  }, [onIntroDone]);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Bắt đầu lại khi sang câu mới
  useEffect(() => {
    st.current = { d: 0, t: 0, boom: 0, shake: 0, phase0: performance.now(), dFrom: 0, introDone: false };
  }, [runKey]);

  useEffect(() => {
    phaseRef.current = phase;
    st.current.phase0 = performance.now();
    st.current.dFrom = st.current.d;
    if (phase === "intro" || phase === "idle") st.current.boom = 0;
  }, [phase]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const s = st.current;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      s.t += dt;
      const el = (now - s.phase0) / 1000;
      const ph = phaseRef.current;
      if (ph === "intro") {
        const k = reduced.current ? 1 : clamp01(el / 2.2);
        s.d = STOP * easeOut(k);
        if (k >= 1 && !s.introDone) {
          s.introDone = true;
          cb.current?.();
        }
      } else if (ph === "idle") {
        s.d += (STOP - s.d) * Math.min(1, dt * 6);
        if (!s.introDone) {
          s.introDone = true;
          cb.current?.();
        }
      } else if (ph === "pass") {
        s.boom = clamp01(el / 0.45);
        s.d = s.dFrom + (el > 0.3 ? 46 * easeIn(clamp01((el - 0.3) / 2.6)) : 0);
        s.shake = 0;
      } else if (ph === "fail") {
        const c = consRef.current;
        if (c === "crash") {
          // lao thẳng vào trạm / chướng ngại rồi dừng khựng
          s.d = s.dFrom + (GATE - STOP - 0.9) * easeIn(clamp01(el / 0.55));
          s.shake = el < 0.55 ? 0 : el < 1.6 ? 1 - (el - 0.55) / 1.05 : 0;
        } else if (c === "danger") {
          s.d = s.dFrom + 1.4 * easeOut(clamp01(el / 0.9));
          s.shake = el < 1.4 ? 0.55 * (1 - el / 1.4) : 0;
        } else if (c === "ok") {
          s.d = s.dFrom + 0.3 * easeOut(clamp01(el / 0.4));
          s.shake = 0;
        } else {
          s.d = s.dFrom + 0.45 * easeOut(clamp01(el / 0.3));
          s.shake = el < 0.9 ? 1 - el / 0.9 : 0;
        }
      }
      setSnap({ d: s.d, t: s.t, boom: s.boom, shake: s.shake });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const scenery = SCENERY[seed % SCENERY.length];
  const has = (p: RoadProp) => props.includes(p);
  const night = has("night");
  const rain = has("rain");
  const fog = has("fog");
  const highway = has("highway");
  const rail = has("rail");
  const light = props.find((p) => p.startsWith("light-"))?.slice(6) as "red" | "yellow" | "green" | undefined;
  const police = props.find((p) => p.startsWith("police-"))?.slice(7) as "up" | "side" | "forward" | undefined;
  const sunset = !night && !rain && !fog && seed % 5 === 3;

  const { d, t, boom, shake } = snap;
  const zg = GATE - d;
  const braking = phase === "fail" || (phase === "intro" && d > STOP * 0.75) || phase === "idle";

  const roadL = highway ? -4.7 : -2.3;
  const roadR = highway ? 4.5 : 2.3;
  const zFar = 70;
  const zNear = 0.6;

  const shakeX = shake ? Math.sin(t * 70) * 6 * shake : 0;

  // Vật thể ven đường lặp lại
  const side: { z: number; X: number }[] = [];
  const spacing = 6.5;
  for (let k = 0; k < 11; k++) {
    const z = k * spacing - (d % spacing) + 1.2;
    if (z > zNear + 0.3) {
      side.push({ z, X: roadR + 1.3 });
      side.push({ z: z + spacing / 2, X: roadL - 1.3 });
    }
  }
  const farSide = side.filter((o) => o.z > zg).sort((a, b) => b.z - a.z);
  const nearSide = side.filter((o) => o.z <= zg).sort((a, b) => b.z - a.z);

  const skyTop = night ? "#050816" : rain || fog ? "#64748b" : sunset ? "#f97316" : "#38bdf8";
  const skyBot = night ? "#1e1b4b" : rain || fog ? "#cbd5e1" : sunset ? "#fde68a" : "#e0f2fe";

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="block h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Tình huống giao thông">
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBot} />
        </linearGradient>
        <linearGradient id="fogG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.3" stopColor="#f1f5f9" stopOpacity="0.85" />
          <stop offset="0.75" stopColor="#f1f5f9" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="beam" x1="0" x2="0" y1="1" y2="0">
          <stop offset="0" stopColor="#fef08a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fef08a" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#ef4444" stopOpacity="0" />
          <stop offset="1" stopColor="#ef4444" stopOpacity="0.65" />
        </radialGradient>
        <radialGradient id="vignetteAmber" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.5" stopColor="#f59e0b" stopOpacity="0" />
          <stop offset="1" stopColor="#f59e0b" stopOpacity="0.6" />
        </radialGradient>
      </defs>

      <g transform={`translate(${shakeX} 0)`}>
        {/* Bầu trời */}
        <rect x={-20} y={-20} width={VW + 40} height={HZ + 22} fill="url(#sky)" />
        {night && <Stars seed={seed} />}
        {!night && !rain && !fog && <Sun sunset={sunset} />}
        {!night && !rain && <Clouds t={t} />}

        {/* Cảnh xa */}
        <g transform={`translate(${-((d * 3) % 640)} 0)`}>
          <Skyline scenery={scenery} seed={seed} night={night} />
        </g>

        {/* Mặt đất */}
        <rect x={-20} y={HZ} width={VW + 40} height={VH - HZ + 20} fill={night ? "#1f2937" : GROUND[scenery]} />
        <polygon points={quad(roadR, roadR + 1.4, zNear, zFar)} fill={night ? "#374151" : "#d6d3d1"} />
        <polygon points={quad(roadL - 1.4, roadL, zNear, zFar)} fill={night ? "#374151" : "#d6d3d1"} />
        <polygon points={quad(roadL, roadR, zNear, zFar)} fill={night ? "#1f2430" : rain ? "#3b4252" : "#4b5563"} />

        {/* Vạch kẻ đường */}
        <polygon points={quad(roadR - 0.18, roadR - 0.08, zNear, zFar)} fill="#f8fafc" />
        <polygon points={quad(roadL + 0.08, roadL + 0.18, zNear, zFar)} fill="#f8fafc" />
        {highway ? (
          <>
            <polygon points={quad(-0.35, 0, zNear, zFar, 0)} fill="#94a3b8" />
            <polygon points={quad(-0.35, 0, zNear, zFar, 0.45)} fill="#cbd5e1" />
            <Dashes X={2.2} d={d} />
            <Dashes X={-2.5} d={d} />
          </>
        ) : (
          <Dashes X={0} d={d} color="#facc15" />
        )}

        {/* Vạch người đi bộ */}
        {(has("crosswalk") || has("school")) && has("crosswalk") && <Crosswalk zg={zg} />}

        {/* Đường ray */}
        {rail && <Rails zg={zg} />}

        {/* Đèn pha ban đêm */}
        {night && <polygon points={quad(-0.1, 2.3, 1.1, 9)} fill="url(#beam)" />}

        {/* Cây, cột đèn phía xa */}
        {farSide.map((o, i) => (
          <Roadside key={`f${i}`} o={o} scenery={scenery} night={night} />
        ))}

        {/* Vật thể tình huống */}
        {has("garage") && <Garage zg={zg} />}
        {has("school") && <School zg={zg} />}
        {rail && <Train zg={zg} t={t} />}
        {police && <Police zg={zg} pose={police} />}
        {has("accident") && <Wreck zg={zg} t={t} fire={false} />}
        {has("fire") && <Wreck zg={zg} t={t} fire />}
        {night && <Oncoming t={t} />}
        {has("crosswalk") && <Walker zg={zg} t={t} child={has("school")} />}
        {signs.length > 0 && <SignPost zg={zg} signs={signs} />}
        {light && <SignalPole zg={zg} color={light} />}
        {rail ? (
          <RailGate zg={zg} boom={boom} t={t} />
        ) : (
          <Gate zg={zg} boom={boom} label={label} phase={phase} highway={highway} />
        )}

        {nearSide.map((o, i) => (
          <Roadside key={`n${i}`} o={o} scenery={scenery} night={night} />
        ))}

        {/* Thời tiết */}
        {fog && <rect x={-20} y={0} width={VW + 40} height={VH} fill="url(#fogG)" />}
        {rain && <Rain t={t} />}
        {night && <rect x={-20} y={0} width={VW + 40} height={VH} fill="#020617" opacity={0.25} />}

        {/* Vệt phanh khi xử lý sai */}
        {phase === "fail" && (consequence === "crash" || consequence === "danger") && <Skid d={d} />}

        {/* Xe của người chơi */}
        <g
          transform={`translate(${VW / 2 + (phase === "fail" && consequence === "danger" ? Math.sin(t * 9) * 14 : 0)} ${
            VH - 6 + (phase === "intro" || phase === "pass" ? Math.sin(t * 30) * 0.8 : 0)
          }) scale(${vehicleScale(vehicle)}) rotate(${phase === "fail" && consequence === "danger" ? Math.sin(t * 9) * 4 : 0})`}
        >
          <RearVehicle kind={vehicle} braking={braking} />
        </g>
      </g>

      {has("ambulance") && <Mirror t={t} />}
      {has("ambulance") && (
        <>
          <rect x={0} y={0} width={14} height={VH} fill="#ef4444" opacity={Math.sin(t * 12) > 0 ? 0.5 : 0} />
          <rect x={VW - 14} y={0} width={14} height={VH} fill="#3b82f6" opacity={Math.sin(t * 12) > 0 ? 0 : 0.5} />
        </>
      )}
      {phase === "fail" && shake > 0 && (
        <rect x={0} y={0} width={VW} height={VH} fill={consequence === "danger" ? "url(#vignetteAmber)" : "url(#vignette)"} opacity={shake} />
      )}
      {phase === "fail" && (consequence === undefined || consequence === "ticket") && (
        <g opacity={0.9}>
          <circle cx={24} cy={24} r={14} fill={Math.sin(t * 14) > 0 ? "#ef4444" : "#1d4ed8"} />
          <circle cx={VW - 24} cy={24} r={14} fill={Math.sin(t * 14) > 0 ? "#1d4ed8" : "#ef4444"} />
        </g>
      )}
      {phase === "fail" && consequence === "ticket" && <TicketCard t={t} />}
      {phase === "fail" && consequence === "crash" && <Shatter d={d} />}
      {phase === "fail" && consequence === "danger" && <DangerFlash t={t} />}
    </svg>
  );
}

function vehicleScale(v: PlayerVehicle) {
  switch (v) {
    case "scooter":
    case "bigbike":
      return 0.85;
    case "trike":
      return 0.8;
    case "car":
      return 0.92;
    case "bus":
    case "trailer":
    case "truck":
      return 0.72;
    default:
      return 0.8;
  }
}

/* ---------------- Hậu quả khi xử lý sai ---------------- */

/** Kính lái rạn vỡ sau va chạm. */
function Shatter({ d }: { d: number }) {
  const k = clamp01((d - STOP) / (GATE - STOP - 1));
  if (k < 0.85) return null;
  const cx = VW / 2 + 40;
  const cy = VH / 2 - 10;
  const rays = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2 + (i % 3) * 0.17;
    const len = 90 + ((i * 37) % 60);
    return `M${cx} ${cy} L${cx + Math.cos(a) * len} ${cy + Math.sin(a) * len}`;
  }).join(" ");
  return (
    <g>
      <rect x={0} y={0} width={VW} height={VH} fill="#fff" opacity={0.08} />
      <path d={rays} stroke="#f8fafc" strokeWidth={2.2} opacity={0.9} fill="none" />
      <path d={rays} stroke="#0f172a" strokeWidth={0.8} opacity={0.6} fill="none" />
      <circle cx={cx} cy={cy} r={22} fill="none" stroke="#f8fafc" strokeWidth={2} opacity={0.8} />
      <circle cx={cx} cy={cy} r={46} fill="none" stroke="#f8fafc" strokeWidth={1.2} opacity={0.6} strokeDasharray="9 7" />
      <polygon
        points={Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const r = i % 2 ? 26 : 52;
          return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
        }).join(" ")}
        fill="#fbbf24"
        stroke="#ef4444"
        strokeWidth={3}
        opacity={0.95}
      />
      <text x={cx} y={cy + 7} textAnchor="middle" fontSize={17} fontWeight={900} fill="#7f1d1d" fontFamily="Arial">
        VA CHẠM
      </text>
    </g>
  );
}

/** Biên bản vi phạm của CSGT. */
function TicketCard({ t }: { t: number }) {
  const k = clamp01(t * 2);
  return (
    <g transform={`translate(${VW / 2 - 70} ${-90 + 100 * easeOut(k)})`} opacity={k}>
      <rect x={4} y={4} width={140} height={54} rx={8} fill="#0006" />
      <rect x={0} y={0} width={140} height={54} rx={8} fill="#fefce8" stroke="#ef4444" strokeWidth={3} />
      <rect x={0} y={0} width={140} height={16} rx={8} fill="#ef4444" />
      <text x={70} y={12} textAnchor="middle" fontSize={9.5} fontWeight={900} fill="#fff" fontFamily="Arial" letterSpacing={1}>
        CẢNH SÁT GIAO THÔNG
      </text>
      <text x={70} y={36} textAnchor="middle" fontSize={15} fontWeight={900} fill="#991b1b" fontFamily="Arial">
        BIÊN BẢN VI PHẠM
      </text>
      <line x1={14} y1={45} x2={126} y2={45} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" />
    </g>
  );
}

/** Cảnh báo mất an toàn (tam giác vàng nhấp nháy). */
function DangerFlash({ t }: { t: number }) {
  const on = Math.sin(t * 8) > -0.2;
  return (
    <g opacity={on ? 1 : 0.35} transform={`translate(${VW / 2} 46)`}>
      <polygon points="0,-26 30,24 -30,24" fill="#facc15" stroke="#b45309" strokeWidth={3} strokeLinejoin="round" />
      <text x={0} y={17} textAnchor="middle" fontSize={26} fontWeight={900} fill="#111" fontFamily="Arial">
        !
      </text>
      <text x={0} y={44} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff" stroke="#000" strokeWidth={0.6} fontFamily="Arial" letterSpacing={1}>
        MẤT AN TOÀN
      </text>
    </g>
  );
}

/** Vệt phanh phía sau xe người chơi. */
function Skid({ d }: { d: number }) {
  const from = Math.max(0.7, 0.9);
  const to = Math.min(6, 1.2 + (d - STOP) * 2.2);
  if (to <= from) return null;
  return (
    <g opacity={0.55}>
      <polygon points={quad(-0.62, -0.42, from, to)} fill="#111827" />
      <polygon points={quad(0.42, 0.62, from, to)} fill="#111827" />
    </g>
  );
}

/* ---------------- Thành phần cảnh ---------------- */

function Dashes({ X, d, color = "#f8fafc" }: { X: number; d: number; color?: string }) {
  const out = [];
  const period = 3.2;
  for (let k = 0; k < 22; k++) {
    const z1 = k * period - (d % period) + 0.4;
    const z2 = z1 + 1.6;
    if (z2 < 0.7) continue;
    out.push(<polygon key={k} points={quad(X - 0.06, X + 0.06, Math.max(0.7, z1), z2)} fill={color} />);
  }
  return <>{out}</>;
}

function Crosswalk({ zg }: { zg: number }) {
  const z1 = zg + 0.35;
  const z2 = zg + 1.35;
  if (z1 < 0.7) return null;
  const out = [];
  for (let X = -2.1; X < 2.2; X += 0.55) out.push(<polygon key={X} points={quad(X, X + 0.3, z1, z2)} fill="#f8fafc" />);
  return <>{out}</>;
}

function Rails({ zg }: { zg: number }) {
  const z = zg + 1.6;
  if (z < 0.8) return null;
  return (
    <>
      <polygon points={quad(-8, 8, z - 0.5, z + 0.5)} fill="#57534e" />
      <polygon points={quad(-8, 8, z - 0.28, z - 0.2)} fill="#d4d4d8" />
      <polygon points={quad(-8, 8, z + 0.2, z + 0.28)} fill="#d4d4d8" />
    </>
  );
}

function Roadside({ o, scenery, night }: { o: { z: number; X: number }; scenery: Scenery; night: boolean }) {
  const b = P(o.X, 0, o.z);
  const s = b.s;
  if (s > 900) return null;
  if (scenery === "city") {
    const top = P(o.X, 2.6, o.z);
    const armX = o.X > 0 ? -0.5 : 0.5;
    const head = P(o.X + armX, 2.6, o.z);
    return (
      <g>
        <line x1={b.x} y1={b.y} x2={top.x} y2={top.y} stroke="#475569" strokeWidth={Math.max(1, s * 0.07)} />
        <line x1={top.x} y1={top.y} x2={head.x} y2={head.y} stroke="#475569" strokeWidth={Math.max(1, s * 0.05)} />
        <ellipse cx={head.x} cy={head.y + s * 0.03} rx={s * 0.14} ry={s * 0.05} fill={night ? "#fef08a" : "#e2e8f0"} />
        {night && <ellipse cx={head.x} cy={head.y + s * 0.3} rx={s * 0.4} ry={s * 0.35} fill="#fef08a" opacity={0.12} />}
      </g>
    );
  }
  const top = P(o.X, scenery === "coast" ? 2.6 : 1.3, o.z);
  const canopy = scenery === "coast" ? "#16a34a" : scenery === "mountain" ? "#166534" : "#15803d";
  if (scenery === "coast") {
    return (
      <g>
        <path d={`M${b.x} ${b.y} Q${b.x + s * 0.15} ${(b.y + top.y) / 2} ${top.x} ${top.y}`} stroke="#92400e" strokeWidth={Math.max(1, s * 0.08)} fill="none" />
        {[-60, -20, 20, 60, 180].map((a) => (
          <ellipse key={a} cx={top.x + Math.cos((a * Math.PI) / 180) * s * 0.3} cy={top.y + Math.sin((a * Math.PI) / 180) * s * 0.1} rx={s * 0.35} ry={s * 0.07} fill={night ? "#14532d" : canopy} transform={`rotate(${a / 3} ${top.x} ${top.y})`} />
        ))}
      </g>
    );
  }
  return (
    <g>
      <line x1={b.x} y1={b.y} x2={top.x} y2={top.y} stroke="#78350f" strokeWidth={Math.max(1, s * 0.1)} />
      {scenery === "mountain" ? (
        <polygon points={`${top.x},${top.y - s * 1.2} ${top.x - s * 0.45},${top.y + s * 0.1} ${top.x + s * 0.45},${top.y + s * 0.1}`} fill={night ? "#14532d" : canopy} />
      ) : (
        <circle cx={top.x} cy={top.y - s * 0.35} r={s * 0.5} fill={night ? "#14532d" : canopy} />
      )}
    </g>
  );
}

function Gate({ zg, boom, label, phase, highway }: { zg: number; boom: number; label?: string; phase: DrivePhase; highway: boolean }) {
  if (zg < 0.9) return null;
  const XL = highway ? -0.2 : -2.6;
  const XR = highway ? 4.7 : 2.6;
  const bl = P(XL, 0, zg);
  const tl = P(XL, 3.7, zg);
  const br = P(XR, 0, zg);
  const tr = P(XR, 3.7, zg);
  const beamB = P(XL, 3.1, zg);
  const s = bl.s;
  const pw = s * 0.28;
  const lampColor = phase === "pass" ? "#22c55e" : phase === "fail" ? "#ef4444" : "#f59e0b";
  // cần chắn
  const pivot = P(highway ? 4.45 : 2.4, 1.0, zg);
  const end = P(0.05, 1.0, zg);
  const ang = -boom * 82;
  return (
    <g>
      <rect x={bl.x - pw / 2} y={tl.y} width={pw} height={bl.y - tl.y} fill="#1f2937" />
      <rect x={br.x - pw / 2} y={tr.y} width={pw} height={br.y - tr.y} fill="#1f2937" />
      <rect x={tl.x - pw / 2} y={tl.y} width={tr.x - tl.x + pw} height={beamB.y - tl.y} rx={s * 0.08} fill={highway ? "#15803d" : "#facc15"} stroke="#111" strokeWidth={Math.max(1, s * 0.03)} />
      {!highway &&
        Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={tl.x - pw / 2 + ((tr.x - tl.x + pw) / 10) * i} y={beamB.y - s * 0.1} width={(tr.x - tl.x + pw) / 20} height={s * 0.1} fill="#111" />
        ))}
      <text x={(tl.x + tr.x) / 2} y={(tl.y + beamB.y) / 2 + s * 0.12} textAnchor="middle" fontSize={s * 0.34} fontWeight={900} fill={highway ? "#fff" : "#111"} fontFamily="var(--font-display), Arial">
        {highway ? "CAO TỐC · 120" : label ?? "TRẠM KIỂM TRA"}
      </text>
      <circle cx={bl.x} cy={P(XL, 2.4, zg).y} r={s * 0.3} fill={lampColor} opacity={0.25} />
      <circle cx={bl.x} cy={P(XL, 2.4, zg).y} r={s * 0.14} fill={lampColor} stroke="#111" strokeWidth={1} />
      <g transform={`rotate(${ang} ${pivot.x} ${pivot.y})`}>
        <line x1={pivot.x} y1={pivot.y} x2={end.x} y2={end.y} stroke="#fff" strokeWidth={s * 0.12} strokeLinecap="round" />
        <line x1={pivot.x} y1={pivot.y} x2={end.x} y2={end.y} stroke="#ef4444" strokeWidth={s * 0.12} strokeDasharray={`${s * 0.3} ${s * 0.3}`} />
      </g>
      <rect x={pivot.x - s * 0.12} y={pivot.y - s * 0.1} width={s * 0.24} height={P(0, 0, zg).y - pivot.y + s * 0.1} fill="#374151" />
    </g>
  );
}

function RailGate({ zg, boom, t }: { zg: number; boom: number; t: number }) {
  if (zg < 0.9) return null;
  const pivot = P(2.5, 1.0, zg);
  const end = P(-2.2, 1.0, zg);
  const post = P(2.5, 0, zg);
  const top = P(2.5, 2.6, zg);
  const s = post.s;
  const on = Math.sin(t * 9) > 0;
  const ang = -boom * 82;
  return (
    <g>
      <line x1={post.x} y1={post.y} x2={top.x} y2={top.y} stroke="#e5e7eb" strokeWidth={s * 0.1} />
      <g transform={`translate(${top.x} ${top.y})`}>
        <rect x={-s * 0.45} y={-s * 0.08} width={s * 0.9} height={s * 0.16} fill="#fff" stroke="#dc2626" strokeWidth={s * 0.03} transform="rotate(30)" />
        <rect x={-s * 0.45} y={-s * 0.08} width={s * 0.9} height={s * 0.16} fill="#fff" stroke="#dc2626" strokeWidth={s * 0.03} transform="rotate(-30)" />
      </g>
      <rect x={top.x - s * 0.36} y={top.y + s * 0.35} width={s * 0.72} height={s * 0.26} rx={s * 0.1} fill="#111" />
      <circle cx={top.x - s * 0.2} cy={top.y + s * 0.48} r={s * 0.1} fill={on ? "#ef4444" : "#450a0a"} />
      <circle cx={top.x + s * 0.2} cy={top.y + s * 0.48} r={s * 0.1} fill={on ? "#450a0a" : "#ef4444"} />
      <g transform={`rotate(${ang} ${pivot.x} ${pivot.y})`}>
        <line x1={pivot.x} y1={pivot.y} x2={end.x} y2={end.y} stroke="#fff" strokeWidth={s * 0.12} strokeLinecap="round" />
        <line x1={pivot.x} y1={pivot.y} x2={end.x} y2={end.y} stroke="#ef4444" strokeWidth={s * 0.12} strokeDasharray={`${s * 0.3} ${s * 0.3}`} />
      </g>
    </g>
  );
}

function Train({ zg, t }: { zg: number; t: number }) {
  const z = zg + 1.6;
  if (z < 1) return null;
  const x0 = -30 + ((t * 9) % 60);
  const cars = [0, 1, 2, 3];
  return (
    <g>
      {cars.map((i) => {
        const X1 = x0 - i * 5.4;
        const X2 = X1 + 5;
        const a = P(X1, 2.6, z);
        const b = P(X2, 0.25, z);
        if (b.x < -50 || a.x > VW + 50) return null;
        return (
          <g key={i}>
            <rect x={a.x} y={a.y} width={b.x - a.x} height={b.y - a.y} rx={a.s * 0.2} fill={i === 0 ? "#1d4ed8" : "#2563eb"} />
            <rect x={a.x} y={a.y + (b.y - a.y) * 0.62} width={b.x - a.x} height={(b.y - a.y) * 0.1} fill="#facc15" />
            {[0.12, 0.37, 0.62].map((f) => (
              <rect key={f} x={a.x + (b.x - a.x) * f} y={a.y + (b.y - a.y) * 0.15} width={(b.x - a.x) * 0.2} height={(b.y - a.y) * 0.3} rx={2} fill="#bfdbfe" />
            ))}
          </g>
        );
      })}
    </g>
  );
}

function SignPost({ zg, signs }: { zg: number; signs: SignCode[] }) {
  const z = zg + 1.4;
  if (z < 0.9) return null;
  const X = 3.3;
  const n = signs.length;
  const size = Math.min(1.1, 2.9 / n);
  const topH = 3.5;
  const base = P(X, 0, z);
  const top = P(X, topH, z);
  const s = base.s;
  return (
    <g>
      <line x1={base.x} y1={base.y} x2={top.x} y2={top.y} stroke="#94a3b8" strokeWidth={Math.max(1.5, s * 0.07)} />
      {signs.map((code, i) => {
        const c = P(X, topH - size / 2 - i * (size + 0.06), z);
        const px = size * s;
        return (
          <g key={code + i} transform={`translate(${c.x - px / 2} ${c.y - px / 2}) scale(${px / 100})`}>
            <SignGraphic code={code} />
            {n > 1 && (
              <g transform="translate(-34 30)">
                <circle cx={16} cy={20} r={16} fill="#0f172a" stroke="#fff" strokeWidth={3} />
                <text x={16} y={28} textAnchor="middle" fontSize={22} fontWeight={900} fill="#fff" fontFamily="Arial">{i + 1}</text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

function SignalPole({ zg, color }: { zg: number; color: "red" | "yellow" | "green" }) {
  const z = zg - 0.2;
  if (z < 0.9) return null;
  const X = 2.75;
  const b = P(X, 0, z);
  const top = P(X, 3.3, z);
  const s = b.s;
  const box = { x: top.x - s * 0.2, y: top.y, w: s * 0.4, h: s * 1.1 };
  const lamp = (i: number, c: string, on: boolean) => (
    <g key={i}>
      {on && <circle cx={top.x} cy={box.y + s * (0.2 + i * 0.35)} r={s * 0.3} fill={c} opacity={0.35} />}
      <circle cx={top.x} cy={box.y + s * (0.2 + i * 0.35)} r={s * 0.13} fill={on ? c : "#1f2937"} />
    </g>
  );
  return (
    <g>
      <line x1={b.x} y1={b.y} x2={top.x} y2={top.y + box.h} stroke="#334155" strokeWidth={Math.max(1.5, s * 0.08)} />
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={s * 0.08} fill="#0f172a" />
      {lamp(0, "#ef4444", color === "red")}
      {lamp(1, "#f59e0b", color === "yellow")}
      {lamp(2, "#22c55e", color === "green")}
    </g>
  );
}

function Police({ zg, pose }: { zg: number; pose: "up" | "side" | "forward" }) {
  const z = zg + 2.6;
  if (z < 1) return null;
  const X = 0.4;
  const g = P(X, 0, z);
  const s = g.s;
  const u = s / 100; // 1 đơn vị thế giới = 100 đơn vị hình vẽ
  return (
    <g transform={`translate(${g.x} ${g.y}) scale(${u})`}>
      <ellipse cx={0} cy={0} rx={70} ry={16} fill="#e5e7eb" stroke="#dc2626" strokeWidth={8} />
      <g transform="translate(0 -12)">
        {/* chân */}
        <rect x={-20} y={-80} width={16} height={80} fill="#1e3a8a" />
        <rect x={4} y={-80} width={16} height={80} fill="#1e3a8a" />
        {/* thân áo vàng */}
        <rect x={-28} y={-150} width={56} height={76} rx={12} fill="#eab308" />
        <rect x={-28} y={-100} width={56} height={8} fill="#fff" />
        {/* tay */}
        {pose === "up" && (
          <>
            <path d="M22 -140 L30 -230" stroke="#eab308" strokeWidth={16} strokeLinecap="round" />
            <path d="M-22 -140 L-30 -80" stroke="#eab308" strokeWidth={16} strokeLinecap="round" />
          </>
        )}
        {pose === "side" && (
          <>
            <path d="M22 -138 L110 -138" stroke="#eab308" strokeWidth={16} strokeLinecap="round" />
            <path d="M-22 -138 L-110 -138" stroke="#eab308" strokeWidth={16} strokeLinecap="round" />
          </>
        )}
        {pose === "forward" && (
          <>
            <path d="M-22 -138 L-40 -118" stroke="#eab308" strokeWidth={18} strokeLinecap="round" />
            <path d="M22 -140 L-80 -80" stroke="#eab308" strokeWidth={16} strokeLinecap="round" opacity={0.95} />
          </>
        )}
        {/* đầu, mũ */}
        <circle cx={0} cy={-170} r={20} fill="#f1c27d" />
        <ellipse cx={0} cy={-186} rx={28} ry={10} fill="#fff" />
        <rect x={-18} y={-204} width={36} height={18} rx={6} fill="#fff" />
        <rect x={-6} y={-198} width={12} height={8} fill="#dc2626" />
        {/* dùi cui */}
        <rect x={pose === "forward" ? -94 : 106} y={pose === "side" ? -150 : pose === "up" ? -250 : -86} width={8} height={30} fill="#fff" stroke="#111" strokeWidth={2} />
      </g>
    </g>
  );
}

function Walker({ zg, t, child }: { zg: number; t: number; child?: boolean }) {
  const z = zg + 0.85;
  if (z < 0.9) return null;
  const people = child ? [0, 1.4, 2.5] : [0];
  return (
    <g>
      {people.map((off, i) => {
        const X = -2.6 + (((t * 0.9 + off) % 5.6) + 5.6) % 5.6;
        const g = P(X, 0, z + i * 0.18);
        const u = g.s / 100;
        const h = child ? 0.75 : 1;
        const step = Math.sin(t * 8 + i) * 18;
        const shirt = ["#ef4444", "#3b82f6", "#22c55e"][i % 3];
        return (
          <g key={i} transform={`translate(${g.x} ${g.y}) scale(${u * h})`}>
            <path d={`M0 -80 L${step} 0 M0 -80 L${-step} 0`} stroke="#1e293b" strokeWidth={14} strokeLinecap="round" />
            <rect x={-18} y={-150} width={36} height={76} rx={14} fill={shirt} />
            {child && <rect x={-22} y={-146} width={16} height={46} rx={6} fill="#facc15" />}
            <path d={`M0 -140 L${-step * 0.8} -90 M0 -140 L${step * 0.8} -90`} stroke={shirt} strokeWidth={11} strokeLinecap="round" />
            <circle cx={0} cy={-170} r={20} fill="#f1c27d" />
            <path d="M-20 -176 Q0 -198 20 -176 Z" fill="#1e293b" />
          </g>
        );
      })}
    </g>
  );
}

function School({ zg }: { zg: number }) {
  const z = zg + 3.2;
  if (z < 1) return null;
  const a = P(4.2, 3.2, z);
  const b = P(9.5, 0, z);
  return (
    <g>
      <rect x={a.x} y={a.y} width={b.x - a.x} height={b.y - a.y} fill="#fbbf24" />
      <polygon points={`${a.x - 6},${a.y} ${b.x + 6},${a.y} ${(a.x + b.x) / 2},${a.y - (b.y - a.y) * 0.35}`} fill="#b91c1c" />
      {[0.1, 0.4, 0.7].map((f) => (
        <rect key={f} x={a.x + (b.x - a.x) * f} y={a.y + (b.y - a.y) * 0.2} width={(b.x - a.x) * 0.18} height={(b.y - a.y) * 0.25} fill="#e0f2fe" />
      ))}
      <rect x={a.x + (b.x - a.x) * 0.05} y={a.y + (b.y - a.y) * 0.58} width={(b.x - a.x) * 0.9} height={(b.y - a.y) * 0.18} fill="#1d4ed8" />
      <text x={(a.x + b.x) / 2} y={a.y + (b.y - a.y) * 0.72} textAnchor="middle" fontSize={a.s * 0.3} fontWeight={800} fill="#fff" fontFamily="Arial">TRƯỜNG TIỂU HỌC</text>
    </g>
  );
}

function Garage({ zg }: { zg: number }) {
  const z = zg + 1.8;
  if (z < 1) return null;
  const a = P(3.9, 2.8, z);
  const b = P(8.5, 0, z);
  const w = b.x - a.x;
  const h = b.y - a.y;
  return (
    <g>
      <rect x={a.x} y={a.y} width={w} height={h} fill="#e2e8f0" />
      <rect x={a.x} y={a.y - h * 0.2} width={w} height={h * 0.22} fill="#0ea5e9" />
      <text x={a.x + w / 2} y={a.y - h * 0.05} textAnchor="middle" fontSize={h * 0.15} fontWeight={900} fill="#fff" fontFamily="Arial">🔧 GARA Ô TÔ</text>
      <rect x={a.x + w * 0.12} y={a.y + h * 0.3} width={w * 0.76} height={h * 0.7} fill="#475569" />
      {[0.4, 0.55, 0.7, 0.85].map((f) => (
        <line key={f} x1={a.x + w * 0.12} x2={a.x + w * 0.88} y1={a.y + h * f} y2={a.y + h * f} stroke="#334155" strokeWidth={2} />
      ))}
    </g>
  );
}

function Wreck({ zg, t, fire }: { zg: number; t: number; fire: boolean }) {
  const z = zg + (fire ? 2.4 : 1.8);
  if (z < 1) return null;
  const g = P(fire ? 1.6 : 1.9, 0, z);
  const u = g.s / 100;
  const tri = P(1.2, 0, zg - 0.4 > 1 ? zg - 0.4 : 1);
  return (
    <g>
      <g transform={`translate(${g.x} ${g.y}) scale(${u}) rotate(${fire ? 0 : -12})`}>
        <rect x={-110} y={-80} width={220} height={70} rx={20} fill={fire ? "#64748b" : "#0ea5e9"} />
        <rect x={-80} y={-130} width={150} height={56} rx={16} fill={fire ? "#475569" : "#0284c7"} />
        <rect x={-66} y={-120} width={120} height={36} rx={8} fill="#1e293b" />
        <circle cx={-70} cy={-8} r={22} fill="#111" />
        <circle cx={70} cy={-8} r={22} fill="#111" />
        {!fire && <path d="M60 -80 L90 -40 L70 -30" stroke="#fff" strokeWidth={6} fill="none" />}
      </g>
      {[0, 1, 2].map((i) => {
        const k = ((t * 0.5 + i / 3) % 1);
        return (
          <circle key={i} cx={g.x + Math.sin(t + i) * g.s * 0.2} cy={g.y - g.s * (1.4 + k * 1.6)} r={g.s * (0.25 + k * 0.4)} fill={fire ? "#334155" : "#94a3b8"} opacity={0.6 * (1 - k)} />
        );
      })}
      {fire &&
        [-0.5, 0, 0.5].map((o, i) => (
          <path
            key={o}
            d={`M${g.x + o * g.s - g.s * 0.25} ${g.y - g.s * 1.1} Q${g.x + o * g.s} ${g.y - g.s * (1.9 + Math.sin(t * 12 + i) * 0.25)} ${g.x + o * g.s + g.s * 0.25} ${g.y - g.s * 1.1} Z`}
            fill={i === 1 ? "#f97316" : "#facc15"}
          />
        ))}
      {!fire && (
        <polygon
          points={`${tri.x},${tri.y - tri.s * 0.5} ${tri.x - tri.s * 0.3},${tri.y} ${tri.x + tri.s * 0.3},${tri.y}`}
          fill="none"
          stroke="#ef4444"
          strokeWidth={Math.max(2, tri.s * 0.07)}
        />
      )}
    </g>
  );
}

function Oncoming({ t }: { t: number }) {
  const z = 34 - ((t * 7) % 32);
  const g = P(-1.1, 0, z);
  const u = g.s / 100;
  return (
    <g transform={`translate(${g.x} ${g.y}) scale(${u})`}>
      <rect x={-95} y={-120} width={190} height={100} rx={24} fill="#111827" />
      <ellipse cx={-62} cy={-58} rx={220} ry={90} fill="#fef9c3" opacity={0.25} />
      <ellipse cx={62} cy={-58} rx={220} ry={90} fill="#fef9c3" opacity={0.25} />
      <circle cx={-62} cy={-58} r={20} fill="#fffbeb" />
      <circle cx={62} cy={-58} r={20} fill="#fffbeb" />
    </g>
  );
}

function Mirror({ t }: { t: number }) {
  const on = Math.sin(t * 12) > 0;
  return (
    <g transform="translate(245 8)">
      <rect x={0} y={0} width={150} height={56} rx={16} fill="#111827" />
      <rect x={5} y={5} width={140} height={46} rx={12} fill="#94a3b8" />
      <rect x={5} y={30} width={140} height={21} fill="#4b5563" />
      <g transform="translate(75 46)">
        <rect x={-26} y={-30} width={52} height={28} rx={6} fill="#fff" />
        <rect x={-18} y={-26} width={36} height={10} rx={2} fill="#1e293b" />
        <rect x={-22} y={-36} width={20} height={6} rx={2} fill={on ? "#ef4444" : "#7f1d1d"} />
        <rect x={2} y={-36} width={20} height={6} rx={2} fill={on ? "#1e3a8a" : "#3b82f6"} />
        <path d="M-3 -12 H3 M0 -15 V-9" stroke="#ef4444" strokeWidth={3} />
      </g>
      <text x={75} y={70} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff" fontFamily="Arial" stroke="#0008" strokeWidth={3} paintOrder="stroke">🚑 phía sau</text>
    </g>
  );
}

function Rain({ t }: { t: number }) {
  const r = rng(7);
  const drops = Array.from({ length: 70 }, () => ({ x: r() * VW, y: r() * VH, l: 10 + r() * 14 }));
  const off = (t * 900) % VH;
  return (
    <g stroke="#e2e8f0" strokeWidth={1.4} opacity={0.55}>
      {drops.map((d, i) => {
        const y = (d.y + off) % VH;
        return <line key={i} x1={d.x} y1={y} x2={d.x - 4} y2={y + d.l} />;
      })}
    </g>
  );
}

function Stars({ seed }: { seed: number }) {
  const r = rng(seed + 3);
  return (
    <g fill="#fff">
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={r() * VW} cy={r() * (HZ - 20)} r={r() * 1.3 + 0.3} opacity={0.4 + r() * 0.6} />
      ))}
    </g>
  );
}

function Sun({ sunset }: { sunset: boolean }) {
  return (
    <g>
      <circle cx={sunset ? 470 : 540} cy={sunset ? 120 : 52} r={sunset ? 34 : 24} fill={sunset ? "#fb923c" : "#fde047"} opacity={0.95} />
      <circle cx={sunset ? 470 : 540} cy={sunset ? 120 : 52} r={sunset ? 54 : 40} fill={sunset ? "#fdba74" : "#fef08a"} opacity={0.35} />
    </g>
  );
}

function Clouds({ t }: { t: number }) {
  const off = (t * 6) % (VW + 200);
  return (
    <g fill="#fff" opacity={0.85}>
      {[
        { x: 80, y: 40, s: 1 },
        { x: 330, y: 70, s: 0.7 },
        { x: 520, y: 30, s: 0.85 },
      ].map((c, i) => {
        const x = ((c.x + off) % (VW + 200)) - 100;
        return (
          <g key={i} transform={`translate(${x} ${c.y}) scale(${c.s})`}>
            <ellipse cx={0} cy={0} rx={34} ry={13} />
            <ellipse cx={22} cy={-8} rx={22} ry={14} />
            <ellipse cx={-18} cy={-5} rx={18} ry={11} />
          </g>
        );
      })}
    </g>
  );
}

function Skyline({ scenery, seed, night }: { scenery: Scenery; seed: number; night: boolean }) {
  const r = rng(seed * 13 + 5);
  const tiles = [0, 640];
    if (scenery === "city") {
      const blds = Array.from({ length: 18 }, (_, i) => ({ x: i * 36 + r() * 6, w: 26 + r() * 16, h: 26 + r() * 70 }));
      return (
        <>
          {tiles.map((ox) => (
            <g key={ox} transform={`translate(${ox} 0)`}>
              {blds.map((b, i) => (
                <g key={i}>
                  <rect x={b.x} y={HZ - b.h} width={b.w} height={b.h + 2} fill={night ? "#1e293b" : i % 3 ? "#94a3b8" : "#64748b"} />
                  {Array.from({ length: Math.floor(b.h / 12) }).map((_, j) => (
                    <rect key={j} x={b.x + 5} y={HZ - b.h + 6 + j * 12} width={b.w - 10} height={4} fill={night ? (j % 2 ? "#fde68a" : "#334155") : "#e2e8f0"} opacity={night ? 0.9 : 0.45} />
                  ))}
                </g>
              ))}
            </g>
          ))}
        </>
      );
    }
    if (scenery === "coast") {
      return (
        <>
          {tiles.map((ox) => (
            <g key={ox} transform={`translate(${ox} 0)`}>
              <rect x={0} y={HZ - 16} width={640} height={18} fill={night ? "#0c4a6e" : "#0ea5e9"} />
              <path d={`M40 ${HZ - 16} Q90 ${HZ - 60} 150 ${HZ - 16} Z M380 ${HZ - 16} Q430 ${HZ - 44} 480 ${HZ - 16} Z`} fill={night ? "#064e3b" : "#15803d"} opacity={0.8} />
            </g>
          ))}
        </>
      );
    }
    const peaks = Array.from({ length: 9 }, (_, i) => ({ x: i * 72 + r() * 20, h: scenery === "mountain" ? 60 + r() * 60 : 18 + r() * 22, w: 60 + r() * 50 }));
    return (
      <>
        {tiles.map((ox) => (
          <g key={ox} transform={`translate(${ox} 0)`}>
            {peaks.map((p, i) => (
              <path
                key={i}
                d={`M${p.x - p.w} ${HZ + 1} Q${p.x - p.w * 0.3} ${HZ - p.h * (scenery === "mountain" ? 1.3 : 1)} ${p.x} ${HZ - p.h} Q${p.x + p.w * 0.3} ${HZ - p.h * (scenery === "mountain" ? 1.3 : 1)} ${p.x + p.w} ${HZ + 1} Z`}
                fill={night ? "#0f172a" : scenery === "mountain" ? (i % 2 ? "#166534" : "#14532d") : i % 2 ? "#4d7c0f" : "#65a30d"}
                opacity={0.9}
              />
            ))}
          </g>
        ))}
      </>
    );
}
