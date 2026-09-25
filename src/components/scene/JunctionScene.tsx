"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dir, JunctionScene as Spec, JunctionVehicle, LightColor } from "@/lib/types";
import { SignGraphic } from "@/components/signs/SignGraphic";
import { TopVehicle, TOP_LABEL } from "./sprites";
import { approachPoint, vehiclePath } from "./junctionPaths";

export type JunctionPhase = "intro" | "idle" | "play" | "done";

const SPEED = 190;
const PALETTE = ["#3b82f6", "#ef4444", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6"];

interface Geo {
  v: JunctionVehicle;
  d: string;
  stop: number;
  len: number;
  /** điểm lấy mẫu dọc quỹ đạo, cách nhau STEP đơn vị */
  pts: [number, number][];
}

const STEP = 2;

/** Đo quỹ đạo bằng phần tử SVG tách rời rồi lấy mẫu thành bảng điểm. */
function measure(paths: { v: JunctionVehicle; d: string; stop: number }[]): Geo[] {
  if (typeof document === "undefined") return [];
  return paths.map((p) => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
    el.setAttribute("d", p.d);
    let len = 0;
    try {
      len = el.getTotalLength();
    } catch {
      len = 0;
    }
    const pts: [number, number][] = [];
    for (let s = 0; s <= len; s += STEP) {
      const pt = el.getPointAtLength(s);
      pts.push([pt.x, pt.y]);
    }
    const end = el.getPointAtLength(len);
    pts.push([end.x, end.y]);
    return { v: p.v, d: p.d, stop: p.stop, len, pts };
  });
}

function pointAt(g: Geo, s: number) {
  const f = Math.max(0, Math.min(g.pts.length - 1, s / STEP));
  const i = Math.floor(f);
  const j = Math.min(g.pts.length - 1, i + 1);
  const k = f - i;
  const x = g.pts[i][0] + (g.pts[j][0] - g.pts[i][0]) * k;
  const y = g.pts[i][1] + (g.pts[j][1] - g.pts[i][1]) * k;
  const a = g.pts[Math.max(0, j - 1)];
  const b = g.pts[j === i ? Math.min(g.pts.length - 1, i + 1) : j];
  let ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  if (a[0] === b[0] && a[1] === b[1] && g.pts.length > 1) {
    const n = g.pts.length - 1;
    ang = Math.atan2(g.pts[n][1] - g.pts[n - 1][1], g.pts[n][0] - g.pts[n - 1][0]);
  }
  return { x, y, ang: (ang * 180) / Math.PI };
}

export function JunctionScene({
  spec,
  phase,
  runKey,
  onIntroDone,
  onDone,
}: {
  spec: Spec;
  phase: JunctionPhase;
  runKey: string | number;
  onIntroDone?: () => void;
  onDone?: () => void;
}) {
  const geo = useMemo(() => measure(spec.vehicles.map((v) => ({ v, ...vehiclePath(v, spec.layout) }))), [spec]);
  const [frame, setFrame] = useState<{ pos: Record<string, number>; step: number }>({ pos: {}, step: -1 });
  const sim = useRef({ t0: 0, phase, intro: false, done: false, reduced: false });
  const cbs = useRef({ onIntroDone, onDone });

  useEffect(() => {
    cbs.current = { onIntroDone, onDone };
  }, [onIntroDone, onDone]);

  useEffect(() => {
    sim.current.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    sim.current.intro = false;
    sim.current.done = false;
    sim.current.t0 = performance.now();
  }, [runKey]);

  useEffect(() => {
    sim.current.phase = phase;
    sim.current.t0 = performance.now();
    if (phase === "play") sim.current.done = false;
  }, [phase]);

  // Lịch di chuyển theo thứ tự
  const schedule = useMemo(() => {
    const gaps = spec.order.map((group) => {
      const minSpeed = Math.min(...group.map((id) => spec.vehicles.find((v) => v.id === id)?.speed ?? 1));
      return Math.max(1.0, 250 / (SPEED * minSpeed));
    });
    return spec.order.map((group, i) => ({ ids: group, start: 0.2 + gaps.slice(0, i).reduce((a, b) => a + b, 0) }));
  }, [spec]);

  useEffect(() => {
    let raf = 0;
    const movingIds = new Set(schedule.flatMap((g) => g.ids));
    const loop = (now: number) => {
      const S = sim.current;
      const el = (now - S.t0) / 1000;
      const pos: Record<string, number> = {};
      let step = -1;
      if (S.phase === "intro" || S.phase === "idle") {
        const dur = S.reduced || S.phase === "idle" ? 0 : 1.5;
        let allDone = true;
        geo.forEach((g, i) => {
          const k = dur === 0 ? 1 : Math.max(0, Math.min(1, (el - i * 0.12) / dur));
          if (k < 1) allDone = false;
          pos[g.v.id] = g.stop * (1 - Math.pow(1 - k, 3));
        });
        if (allDone && !S.intro) {
          S.intro = true;
          cbs.current.onIntroDone?.();
        }
      } else {
        let finished = true;
        geo.forEach((g) => {
          if (!movingIds.has(g.v.id)) pos[g.v.id] = g.stop;
        });
        schedule.forEach((grp, gi) => {
          if (el >= grp.start) step = gi;
          grp.ids.forEach((id) => {
            const g = geo.find((x) => x.v.id === id);
            if (!g) return;
            const v = SPEED * (g.v.speed ?? 1);
            const tt = Math.max(0, el - grp.start);
            const acc = 0.45;
            const dist = tt < acc ? (v * tt * tt) / (2 * acc) : v * (tt - acc / 2);
            const s = Math.min(g.len, g.stop + dist);
            pos[id] = s;
            if (s < g.len - 1) finished = false;
          });
        });
        if (spec.stopAll && el < 1.8) finished = false;
        if (finished && !S.done) {
          S.done = true;
          cbs.current.onDone?.();
        }
      }
      setFrame({ pos, step });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [geo, schedule, spec.stopAll]);

  const playing = phase === "play" || phase === "done";
  const moving = new Set(spec.order.flat());
  const step = playing ? frame.step : -1;
  const caption = playing
    ? spec.stopAll
      ? "Tất cả các xe phải dừng lại!"
      : step >= 0
        ? `${step + 1}. ${spec.steps?.[step] ?? spec.order[step].map((id) => labelOf(spec.vehicles.find((v) => v.id === id)!)).join(" + ")}`
        : null
    : null;

  return (
    <div className="relative h-full w-full">
      <svg viewBox="-120 20 640 360" className="block h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Sa hình giao lộ">
        <Board spec={spec} />

        {!playing && geo.map((g) => <IntentArrow key={g.v.id} g={g} player={!!g.v.player} />)}

        {spec.police && <PoliceTop facing={spec.police.facing} pose={spec.police.pose} />}

        {/* xe */}
        {geo.map((g, i) => {
          const s = frame.pos[g.v.id] ?? 0;
          if (s >= g.len - 1) return null;
          const p = pointAt(g, s);
          const violator = spec.violators?.includes(g.v.id);
          const waiting = playing && !moving.has(g.v.id);
          const blink = g.v.move === "left" || g.v.move === "uturn" ? "left" : g.v.move === "right" ? "right" : undefined;
          return (
            <g key={g.v.id}>
              <g transform={`translate(${p.x} ${p.y}) rotate(${p.ang})`}>
                {g.v.player && <circle r={30} fill="none" stroke="#facc15" strokeWidth={3} strokeDasharray="6 5" className="spin-slow" />}
                {playing && violator && <circle r={32} fill="#ef4444" opacity={0.3} className="pulse-soft" />}
                {(spec.stopAll || waiting) && playing && <circle r={30} fill="none" stroke="#ef4444" strokeWidth={3} opacity={0.8} />}
                <TopVehicle kind={g.v.kind} color={g.v.color ?? PALETTE[i % PALETTE.length]} blink={s <= g.stop + 60 ? blink : undefined} />
              </g>
              <Badge x={p.x} y={p.y - 30} text={labelOf(g.v)} player={!!g.v.player} violator={playing && !!violator} />
            </g>
          );
        })}

        {spec.police && <PoseCard pose={spec.police.pose} />}
      </svg>
      {caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center px-2">
          <div className="max-w-[92%] rounded-full bg-slate-950/85 px-4 py-1.5 text-center text-xs font-semibold text-white shadow-lg ring-1 ring-white/15 sm:text-sm">
            {caption}
          </div>
        </div>
      )}
    </div>
  );
}

function labelOf(v: JunctionVehicle) {
  return v.label ?? TOP_LABEL[v.kind];
}

function Badge({ x, y, text, player, violator }: { x: number; y: number; text: string; player: boolean; violator: boolean }) {
  const label = player ? `${text} · BẠN` : text;
  const w = label.length * 6.2 + 14;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-10} width={w} height={17} rx={8.5} fill={violator ? "#dc2626" : player ? "#facc15" : "#0f172a"} opacity={0.92} />
      <text y={3} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={player && !violator ? "#111" : "#fff"} fontFamily="var(--font-sans), Arial">
        {violator ? `${text} · VI PHẠM` : label}
      </text>
    </g>
  );
}

function IntentArrow({ g, player }: { g: Geo; player: boolean }) {
  if (!g.len) return null;
  const seg = Math.min(g.len - g.stop - 5, 230);
  const b = pointAt(g, g.stop + seg);
  const color = player ? "#facc15" : "#ffffff";
  return (
    <g opacity={0.9}>
      <path d={g.d} fill="none" stroke={color} strokeWidth={3} strokeLinecap="butt" strokeDasharray={`0 ${g.stop + 26} ${seg - 30} ${g.len}`} />
      <g transform={`translate(${b.x} ${b.y}) rotate(${b.ang})`}>
        <polygon points="0,0 -12,-7 -12,7" fill={color} />
      </g>
    </g>
  );
}

/* ---------------- Mặt bằng giao lộ ---------------- */

const ROAD = "#3f4450";
const WALK = "#d6d3d1";
const GRASS = "#5f9139";

function Board({ spec }: { spec: Spec }) {
  const { layout } = spec;
  const hasN = layout !== "tee";
  return (
    <g>
      <rect x={-140} y={0} width={680} height={400} fill={GRASS} />
      <Decor layout={layout} />
      {layout === "road" ? (
        <g>
          <rect x={-140} y={128} width={680} height={144} fill={WALK} />
          <rect x={-140} y={140} width={680} height={120} fill={ROAD} />
          <line x1={-140} x2={540} y1={143} y2={143} stroke="#fff" strokeWidth={2} />
          <line x1={-140} x2={540} y1={257} y2={257} stroke="#fff" strokeWidth={2} />
          {spec.centerLine === "solid" ? (
            <>
              <line x1={-140} x2={540} y1={197.5} y2={197.5} stroke="#facc15" strokeWidth={2.5} />
              <line x1={-140} x2={540} y1={202.5} y2={202.5} stroke="#facc15" strokeWidth={2.5} />
            </>
          ) : (
            <line x1={-140} x2={540} y1={200} y2={200} stroke="#facc15" strokeWidth={3} strokeDasharray="18 14" />
          )}
        </g>
      ) : (
        <g>
          {/* vỉa hè */}
          <rect x={-140} y={128} width={680} height={144} fill={WALK} />
          <rect x={128} y={hasN ? -20 : 128} width={144} height={hasN ? 440 : 292} fill={WALK} />
          {/* mặt đường */}
          <rect x={-140} y={140} width={680} height={120} fill={ROAD} />
          <rect x={140} y={hasN ? -20 : 140} width={120} height={hasN ? 440 : 280} fill={ROAD} />
          {layout === "roundabout" ? (
            <>
              <circle cx={200} cy={200} r={132} fill={WALK} />
              <circle cx={200} cy={200} r={122} fill={ROAD} />
              <rect x={-140} y={140} width={680} height={120} fill={ROAD} />
              <rect x={140} y={-20} width={120} height={440} fill={ROAD} />
              <circle cx={200} cy={200} r={122} fill={ROAD} />
              <circle cx={200} cy={200} r={52} fill="#e7e5e4" />
              <circle cx={200} cy={200} r={46} fill="#4d7c0f" />
              <circle cx={200} cy={200} r={16} fill="#166534" />
              <circle cx={188} cy={190} r={10} fill="#15803d" />
              <circle cx={212} cy={210} r={11} fill="#15803d" />
              <circle cx={200} cy={200} r={88} fill="none" stroke="#ffffff22" strokeWidth={2} strokeDasharray="10 12" />
            </>
          ) : null}
          <CenterLines layout={layout} />
          {layout !== "roundabout" && <Crosswalks layout={layout} />}
          <StopLines spec={spec} />
          {spec.main && <MainLabel main={spec.main} />}
        </g>
      )}
      {spec.lights &&
        (["S", "N", "E", "W"] as Dir[])
          .filter((d) => hasN || d !== "N")
          .map((d) => {
            const c = d === "N" || d === "S" ? spec.lights!.NS : spec.lights!.EW;
            if (!c) return null;
            const [x, y] = approachPoint([280, 292], d);
            return <LightBox key={d} x={x} y={y} color={c} />;
          })}
      {spec.signs?.map((s, i) => {
        const [x, y] = approachPoint([296, 336], s.at);
        return (
          <g key={i} transform={`translate(${x - 17} ${y - 17})`}>
            <circle cx={17} cy={34} r={3} fill="#0005" />
            <g transform="scale(0.34)">
              <SignGraphic code={s.code} />
            </g>
          </g>
        );
      })}
    </g>
  );
}

function CenterLines({ layout }: { layout: Spec["layout"] }) {
  const inner = layout === "roundabout" ? 136 : 128;
  const y1 = 200 - inner;
  const y2 = 200 + inner;
  return (
    <g stroke="#facc15" strokeWidth={3}>
      {layout !== "tee" && <line x1={200} x2={200} y1={-20} y2={y1} strokeDasharray="16 12" />}
      <line x1={200} x2={200} y1={y2} y2={420} strokeDasharray="16 12" />
      <line x1={-140} x2={y1} y1={200} y2={200} strokeDasharray="16 12" />
      <line x1={y2} x2={540} y1={200} y2={200} strokeDasharray="16 12" />
    </g>
  );
}

function Crosswalks({ layout }: { layout: Spec["layout"] }) {
  const stripes = (k: Dir) => {
    const out = [];
    for (let x = 144; x < 258; x += 13) {
      const a = approachPoint([x, 264], k);
      const b = approachPoint([x + 7, 282], k);
      out.push(<rect key={x} x={Math.min(a[0], b[0])} y={Math.min(a[1], b[1])} width={Math.abs(b[0] - a[0])} height={Math.abs(b[1] - a[1])} fill="#f8fafc" opacity={0.9} />);
    }
    return out;
  };
  const dirs: Dir[] = layout === "tee" ? ["S", "E", "W"] : ["S", "E", "W", "N"];
  return <g>{dirs.map((d) => <g key={d}>{stripes(d)}</g>)}</g>;
}

function StopLines({ spec }: { spec: Spec }) {
  const dirs: Dir[] = spec.layout === "tee" ? ["S", "E", "W"] : ["S", "E", "W", "N"];
  const y = spec.layout === "roundabout" ? 330 : 288;
  return (
    <g>
      {dirs.map((d) => {
        const yieldLine = spec.layout === "roundabout" || (spec.main && ((spec.main === "NS" && (d === "E" || d === "W")) || (spec.main === "EW" && (d === "N" || d === "S"))));
        const a = approachPoint([202, y], d);
        const b = approachPoint([258, y], d);
        return (
          <line
            key={d}
            x1={a[0]}
            y1={a[1]}
            x2={b[0]}
            y2={b[1]}
            stroke="#fff"
            strokeWidth={yieldLine ? 3 : 4}
            strokeDasharray={yieldLine ? "7 5" : undefined}
          />
        );
      })}
    </g>
  );
}

function MainLabel({ main }: { main: "NS" | "EW" }) {
  return main === "EW" ? (
    <text x={-60} y={165} fontSize={11} fontWeight={800} fill="#fde68a" opacity={0.85} fontFamily="Arial">ĐƯỜNG ƯU TIÊN ◆</text>
  ) : (
    <text x={150} y={60} fontSize={11} fontWeight={800} fill="#fde68a" opacity={0.85} fontFamily="Arial" transform="rotate(-90 150 60)">ĐƯỜNG ƯU TIÊN ◆</text>
  );
}

function LightBox({ x, y, color }: { x: number; y: number; color: LightColor }) {
  const lamp = (i: number, c: LightColor, fill: string) => (
    <g key={c}>
      {color === c && <circle cx={x} cy={y - 16 + i * 11} r={9} fill={fill} opacity={0.35} />}
      <circle cx={x} cy={y - 16 + i * 11} r={4.2} fill={color === c ? fill : "#1f2937"} />
    </g>
  );
  return (
    <g>
      <rect x={x - 7} y={y - 23} width={14} height={36} rx={4} fill="#0f172a" stroke="#475569" />
      {lamp(0, "red", "#ef4444")}
      {lamp(1, "yellow", "#f59e0b")}
      {lamp(2, "green", "#22c55e")}
    </g>
  );
}

function Decor({ layout }: { layout: Spec["layout"] }) {
  const houses =
    layout === "road"
      ? [
          { x: -100, y: 40, w: 70, h: 60, c: "#f97316" },
          { x: 60, y: 44, w: 90, h: 56, c: "#e11d48" },
          { x: 260, y: 36, w: 70, h: 64, c: "#0ea5e9" },
          { x: 380, y: 290, w: 90, h: 60, c: "#a855f7" },
          { x: -60, y: 300, w: 80, h: 56, c: "#22c55e" },
          { x: 150, y: 296, w: 70, h: 60, c: "#eab308" },
        ]
      : [
          { x: -100, y: 40, w: 70, h: 60, c: "#f97316" },
          { x: 20, y: 60, w: 80, h: 50, c: "#e11d48" },
          { x: 300, y: 40, w: 80, h: 64, c: "#0ea5e9" },
          { x: 410, y: 58, w: 70, h: 50, c: "#a855f7" },
          { x: -90, y: 292, w: 80, h: 60, c: "#22c55e" },
          { x: 30, y: 300, w: 72, h: 52, c: "#eab308" },
          { x: 310, y: 296, w: 76, h: 56, c: "#14b8a6" },
          { x: 420, y: 290, w: 70, h: 64, c: "#64748b" },
        ];
  const trees = [
    [-110, 118], [110, 110], [300, 116], [500, 112], [-20, 285], [120, 290], [290, 286], [505, 290], [470, 20], [-20, 20],
  ];
  return (
    <g>
      {houses.map((h, i) => (
        <g key={i}>
          <rect x={h.x + 3} y={h.y + 3} width={h.w} height={h.h} rx={4} fill="#0003" />
          <rect x={h.x} y={h.y} width={h.w} height={h.h} rx={4} fill={h.c} />
          <line x1={h.x} x2={h.x + h.w} y1={h.y + h.h / 2} y2={h.y + h.h / 2} stroke="#0002" strokeWidth={2} />
        </g>
      ))}
      {trees.map(([x, y], i) => (
        <g key={`t${i}`}>
          <circle cx={x + 2} cy={y + 2} r={10} fill="#0003" />
          <circle cx={x} cy={y} r={10} fill="#166534" />
          <circle cx={x - 3} cy={y - 3} r={5} fill="#22c55e" opacity={0.6} />
        </g>
      ))}
    </g>
  );
}

const FACE_ANGLE: Record<Dir, number> = { E: 0, S: 90, W: 180, N: -90 };

function PoliceTop({ facing, pose }: { facing: Dir; pose: "up" | "side" | "forward" }) {
  return (
    <g transform={`translate(200 200) rotate(${FACE_ANGLE[facing]})`}>
      <circle r={22} fill="#0003" transform="translate(2 2)" />
      <circle r={22} fill="#e2e8f0" stroke="#64748b" strokeWidth={2} />
      <circle r={16} fill="none" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />
      {pose === "side" && <line x1={0} y1={-26} x2={0} y2={26} stroke="#eab308" strokeWidth={5} strokeLinecap="round" />}
      {pose === "forward" && <line x1={0} y1={8} x2={24} y2={8} stroke="#eab308" strokeWidth={5} strokeLinecap="round" />}
      <ellipse rx={6} ry={11} fill="#eab308" />
      <circle r={5.5} fill="#f8fafc" stroke="#94a3b8" />
      {pose === "up" && <circle cx={0} cy={10} r={3.5} fill="#f1c27d" stroke="#eab308" />}
      <polygon points="9,0 4,-3 4,3" fill="#1e293b" />
    </g>
  );
}

const POSE_TEXT = { up: "Tay giơ thẳng đứng", side: "Dang ngang tay", forward: "Tay phải giơ về trước" };

function PoseCard({ pose }: { pose: "up" | "side" | "forward" }) {
  return (
    <g transform="translate(402 28)">
      <rect width={112} height={128} rx={12} fill="#0f172ae6" stroke="#ffffff33" />
      <g transform="translate(56 124) scale(0.36)">
        <rect x={-20} y={-80} width={16} height={80} fill="#1e3a8a" />
        <rect x={4} y={-80} width={16} height={80} fill="#1e3a8a" />
        <rect x={-28} y={-150} width={56} height={76} rx={12} fill="#eab308" />
        {pose === "up" && (
          <>
            <path d="M22 -140 L30 -230" stroke="#eab308" strokeWidth={16} strokeLinecap="round" />
            <path d="M-22 -140 L-30 -80" stroke="#eab308" strokeWidth={16} strokeLinecap="round" />
          </>
        )}
        {pose === "side" && <path d="M-110 -138 L110 -138" stroke="#eab308" strokeWidth={16} strokeLinecap="round" />}
        {pose === "forward" && (
          <>
            <path d="M-22 -138 L-40 -90" stroke="#eab308" strokeWidth={16} strokeLinecap="round" />
            <path d="M22 -138 L60 -128" stroke="#eab308" strokeWidth={16} strokeLinecap="round" />
            <circle cx={70} cy={-126} r={12} fill="#f1c27d" />
          </>
        )}
        <circle cx={0} cy={-170} r={20} fill="#f1c27d" />
        <rect x={-18} y={-204} width={36} height={18} rx={6} fill="#fff" />
        <ellipse cx={0} cy={-186} rx={28} ry={8} fill="#fff" />
      </g>
      <text x={56} y={18} textAnchor="middle" fontSize={10} fontWeight={800} fill="#facc15" fontFamily="Arial">CSGT</text>
      <text x={56} y={32} textAnchor="middle" fontSize={9} fontWeight={600} fill="#fff" fontFamily="Arial">{POSE_TEXT[pose]}</text>
    </g>
  );
}
