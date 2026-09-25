"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { activeStreak, useHydrated, useProgress } from "@/store/progress";
import { rankOf } from "@/lib/rank";

export function PlayerChip() {
  const hydrated = useHydrated();
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak);
  if (!hydrated) return <div className="h-9 w-40 animate-pulse rounded-full bg-white/5" />;
  const r = rankOf(xp);
  const days = activeStreak(streak);
  return (
    <Link href="/tien-do" className="flex items-center gap-2 rounded-full transition hover:opacity-90" aria-label="Hồ sơ của tôi">
      <div
        className="flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-1.5 text-sm font-bold text-orange-300 ring-1 ring-orange-400/30"
        title="Chuỗi ngày học liên tiếp"
      >
        <Flame className="h-4 w-4" />
        <span className="font-hud">{days}</span>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-white/5 py-1 pl-1 pr-3 ring-1 ring-white/10" title={`${r.name} — ${xp} XP`}>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lane/20 text-sm">{r.icon}</span>
        <div className="hidden leading-tight sm:block">
          <div className="text-[0.6875rem] font-semibold text-white/60">Cấp {r.level}</div>
          <div className="text-xs font-bold text-white">{r.name}</div>
        </div>
        <span className="font-hud text-sm font-bold text-lane">{xp} XP</span>
      </div>
    </Link>
  );
}
