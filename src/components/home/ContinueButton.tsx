"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useHydrated, useProgress } from "@/store/progress";

export function ContinueButton() {
  const hydrated = useHydrated();
  const last = useProgress((s) => s.lastLicense);
  if (!hydrated || !last) {
    return (
      <Link href="#hang-bang" className="inline-flex items-center gap-2 rounded-2xl bg-lane px-6 py-3.5 font-extrabold text-slate-900 shadow-[0_10px_40px_rgba(255,210,63,.35)] transition hover:brightness-110">
        Chọn xe & bắt đầu <ArrowRight className="h-5 w-5" />
      </Link>
    );
  }
  return (
    <Link href={`/hang/${last.toLowerCase()}`} className="inline-flex items-center gap-2 rounded-2xl bg-lane px-6 py-3.5 font-extrabold text-slate-900 shadow-[0_10px_40px_rgba(255,210,63,.35)] transition hover:brightness-110">
      Tiếp tục hạng {last} <ArrowRight className="h-5 w-5" />
    </Link>
  );
}
