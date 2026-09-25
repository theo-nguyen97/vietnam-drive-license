"use client";

import { useEffect, useState } from "react";
import { DriveScene, type DrivePhase } from "@/components/scene/DriveScene";
import type { PlayerVehicle, RoadProp, SignCode } from "@/lib/types";

const DEMOS: { vehicle: PlayerVehicle; signs?: SignCode[]; props?: RoadProp[]; seed: number; caption: string }[] = [
  { vehicle: "car", signs: ["P.127"], seed: 4, caption: "Biển tốc độ tối đa — bạn được chạy bao nhiêu?" },
  { vehicle: "scooter", props: ["police-side"], seed: 1, caption: "CSGT dang ngang tay — đi hay dừng?" },
  { vehicle: "bus", props: ["rail"], seed: 2, caption: "Rào chắn đường sắt đang hạ…" },
  { vehicle: "car", props: ["light-yellow"], signs: ["W.209"], seed: 7, caption: "Đèn vàng bật — xử lý thế nào?" },
];

export function HeroDemo() {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<DrivePhase>("intro");
  useEffect(() => {
    const a = setTimeout(() => setPhase("pass"), 4200);
    const b = setTimeout(() => {
      setI((x) => (x + 1) % DEMOS.length);
      setPhase("intro");
    }, 6800);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [i]);
  const d = DEMOS[i];
  return (
    <div className="relative">
      <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-lane/30 via-transparent to-sky-500/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 ring-1 ring-white/15 shadow-2xl">
        <div className="aspect-video">
          <DriveScene vehicle={d.vehicle} signs={d.signs} props={d.props} phase={phase} runKey={i} seed={d.seed} label="TRẠM 1" />
        </div>
        <div className="absolute inset-x-3 bottom-3 rounded-xl bg-slate-950/80 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/10 backdrop-blur">
          <span className="mr-2 rounded bg-lane px-1.5 py-0.5 font-hud text-xs font-bold text-slate-900">?</span>
          {d.caption}
        </div>
      </div>
    </div>
  );
}
