import type { Dir, JunctionScene, JunctionVehicle, Move } from "@/lib/types";

type Pt = [number, number];
type Seg =
  | { c: "M" | "L"; p: Pt }
  | { c: "Q"; k: Pt; p: Pt }
  | { c: "A"; r: number; large: 0 | 1; p: Pt };

const C = 200;
const SPAWN = 580;
const ROT: Record<Dir, number> = { S: 0, W: 1, N: 2, E: 3 };

function rot([x, y]: Pt, k: number): Pt {
  let p: Pt = [x, y];
  for (let i = 0; i < k; i++) p = [C - (p[1] - C), C + (p[0] - C)];
  return p;
}

function str(segs: Seg[], k: number) {
  return segs
    .map((s) => {
      const p = rot(s.p, k);
      if (s.c === "Q") {
        const q = rot(s.k, k);
        return `Q${q[0].toFixed(1)},${q[1].toFixed(1)} ${p[0].toFixed(1)},${p[1].toFixed(1)}`;
      }
      if (s.c === "A") return `A${s.r},${s.r} 0 ${s.large} 0 ${p[0].toFixed(1)},${p[1].toFixed(1)}`;
      return `${s.c}${p[0].toFixed(1)},${p[1].toFixed(1)}`;
    })
    .join(" ");
}

/* Quỹ đạo xuất phát từ phía Nam (đi lên), làn bên phải x = 230 */
const CROSS: Record<Move, Seg[]> = {
  straight: [{ c: "M", p: [230, SPAWN] }, { c: "L", p: [230, -200] }],
  right: [{ c: "M", p: [230, SPAWN] }, { c: "L", p: [230, 262] }, { c: "Q", k: [230, 230], p: [262, 230] }, { c: "L", p: [760, 230] }],
  left: [{ c: "M", p: [230, SPAWN] }, { c: "L", p: [230, 262] }, { c: "Q", k: [230, 170], p: [138, 170] }, { c: "L", p: [-360, 170] }],
  uturn: [
    { c: "M", p: [230, SPAWN] },
    { c: "L", p: [230, 215] },
    { c: "Q", k: [230, 160], p: [200, 160] },
    { c: "Q", k: [170, 160], p: [170, 215] },
    { c: "L", p: [170, SPAWN] },
  ],
};

const ENTRY: Seg[] = [{ c: "M", p: [230, SPAWN] }, { c: "L", p: [230, 335] }, { c: "Q", k: [230, 292], p: [256.6, 267.4] }];
const ROUND: Record<Move, Seg[]> = {
  right: [...ENTRY, { c: "A", r: 88, large: 0, p: [276.2, 244] }, { c: "Q", k: [296, 232], p: [330, 230] }, { c: "L", p: [760, 230] }],
  straight: [...ENTRY, { c: "A", r: 88, large: 0, p: [244, 123.8] }, { c: "Q", k: [230, 116], p: [230, 80] }, { c: "L", p: [230, -200] }],
  left: [...ENTRY, { c: "A", r: 88, large: 1, p: [123.8, 156] }, { c: "Q", k: [116, 170], p: [80, 170] }, { c: "L", p: [-360, 170] }],
  uturn: [...ENTRY, { c: "A", r: 88, large: 1, p: [156, 276.2] }, { c: "Q", k: [170, 284], p: [170, 330] }, { c: "L", p: [170, SPAWN] }],
};

export function vehiclePath(v: JunctionVehicle, layout: JunctionScene["layout"]): { d: string; stop: number } {
  if (v.custom) return v.custom;
  const k = ROT[v.from];
  const q = (v.queue ?? 0) * 62;
  if (layout === "roundabout") {
    return { d: str(ROUND[v.move], k), stop: SPAWN - 348 - q };
  }
  const stop = v.inside ? SPAWN - 245 : SPAWN - 310 - q;
  return { d: str(CROSS[v.move], k), stop };
}

/** Điểm đặt đèn/biển theo hướng tiếp cận (vị trí bên phải của làn đi tới). */
export function approachPoint(base: Pt, from: Dir): Pt {
  return rot(base, ROT[from]);
}
