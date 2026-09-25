"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Car, Target, Route, BarChart3 } from "lucide-react";
import clsx from "clsx";
import { useHydrated, useProgress } from "@/store/progress";

/** Thanh tab cố định dưới đáy màn hình trên điện thoại (kiểu ứng dụng). */
export function MobileTabBar() {
  const path = usePathname() ?? "/";
  const hydrated = useHydrated();
  const last = useProgress((s) => s.lastLicense);
  const learnHref = hydrated && last ? `/hang/${last.toLowerCase()}` : "/#hang-bang";
  const tabs = [
    { href: "/", label: "Trang chủ", icon: Home, active: path === "/" },
    { href: learnHref, label: hydrated && last ? `Học ${last}` : "Học", icon: Car, active: path.startsWith("/hang/") },
    { href: "/san-bien-bao", label: "Mini game", icon: Target, active: path.startsWith("/san-bien-bao") },
    { href: "/lo-trinh", label: "Lộ trình", icon: Route, active: path.startsWith("/lo-trinh") },
    { href: "/tien-do", label: "Tiến độ", icon: BarChart3, active: path.startsWith("/tien-do") },
  ];
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
