"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useHydrated, useProgress } from "@/store/progress";
import { navItems } from "./navItems";

/** Thanh tab cố định dưới đáy màn hình trên điện thoại (kiểu ứng dụng). */
export function MobileTabBar() {
  const path = usePathname() ?? "/";
  const hydrated = useHydrated();
  const last = useProgress((s) => s.lastLicense);
  const tabs = navItems(path, hydrated ? last : null);
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-asphalt-950/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
      aria-label="Điều hướng chính"
    >
      <div className="lane-divider absolute inset-x-0 top-0 h-[2px] opacity-40" />
      <ul className="grid grid-cols-5">
        {tabs.map(({ href, label, icon: Icon, active }) => (
          <li key={label}>
            <Link href={href} className="flex flex-col items-center gap-1 py-2 text-[0.65625rem] font-semibold" aria-current={active ? "page" : undefined}>
              <span
                className={clsx(
                  "flex h-8 w-12 items-center justify-center rounded-full transition",
                  active ? "bg-lane text-slate-950 shadow-[0_2px_0_#a87800]" : "text-white/60",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className={active ? "text-white" : "text-white/55"}>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
