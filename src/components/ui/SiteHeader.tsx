import Link from "next/link";
import { Logo } from "./Logo";
import { PlayerChip } from "./PlayerChip";

const NAV = [
  { href: "/#hang-bang", label: "Hạng bằng" },
  { href: "/bien-bao", label: "Biển báo" },
  { href: "/tien-do", label: "Tiến độ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-asphalt-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <PlayerChip />
      </div>
      <nav className="flex items-center justify-around border-t border-white/5 md:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="flex-1 py-2 text-center text-xs font-semibold text-white/70">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
