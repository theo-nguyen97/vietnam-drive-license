"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useHydrated, useProgress } from "@/store/progress";
import { navItems } from "./navItems";

export function DesktopNav() {
  const path = usePathname() ?? "/";
  const hydrated = useHydrated();
  const last = useProgress((s) => s.lastLicense);
  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Điều hướng chính">
      {navItems(path, hydrated ? last : null).map((n) => (
        <Link
          key={n.label}
          href={n.href}
          aria-current={n.active ? "page" : undefined}
          className={clsx(
            "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
            n.active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
          )}
        >
          {n.label}
        </Link>
      ))}
    </nav>
  );
}
