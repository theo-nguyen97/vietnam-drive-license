"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Gauge, IdCard, Info, Newspaper, Route, Signpost, Target, Crosshair, Lightbulb, Clapperboard } from "lucide-react";
import { useHydrated, useProgress } from "@/store/progress";

type Tile = { href: string; icon: ReactNode; title: string; desc: string; tone: string; big?: boolean };

export function ExploreGrid() {
  const hydrated = useHydrated();
  const last = useProgress((s) => s.lastLicense);
  const base = hydrated && last ? `/hang/${last.toLowerCase()}` : null;

  const tiles: Tile[] = [
    { href: "/lo-trinh", icon: <Route className="h-6 w-6" />, title: "Lộ trình lấy bằng", desc: "Từng bước từ hồ sơ đến nhận bằng, kèm hướng dẫn sa hình thực hành có hình động.", tone: "from-emerald-500/25 text-emerald-300", big: true },
    { href: "/bien-bao", icon: <Signpost className="h-6 w-6" />, title: "Thư viện biển báo", desc: "Các biển báo hay gặp trong đề, tra nhanh theo nhóm.", tone: "from-sky-500/25 text-sky-300", big: true },
    { href: "/hoc-meo", icon: <Lightbulb className="h-6 w-6" />, title: "Học mẹo", desc: "Câu thần chú sa hình, con số phải nhớ, cặp biển dễ nhầm và mẹo nhớ cho từng câu.", tone: "from-amber-500/25 text-amber-300", big: true },
    { href: base ? `${base}/on-tap/mo-phong` : "/chon-hang", icon: <Clapperboard className="h-6 w-6" />, title: "Tình huống mô phỏng", desc: "Chọn sai để xem điều gì xảy ra: va chạm, vượt đèn đỏ, bị CSGT dừng xe.", tone: "from-red-500/25 text-red-300", big: true },
    { href: "/san-bien-bao", icon: <Target className="h-5 w-5" />, title: "Săn biển báo", desc: "Mini game 60 giây", tone: "from-cyan-500/20 text-cyan-300" },
    { href: base ? `${base}/thu-thach` : "/chon-hang", icon: <Gauge className="h-5 w-5" />, title: "Thử thách 12 điểm", desc: "Sai là bị trừ điểm GPLX", tone: "from-rose-500/20 text-rose-300" },
    { href: base ? `${base}/diem-yeu` : "/chon-hang", icon: <Crosshair className="h-5 w-5" />, title: "Phân tích điểm yếu", desc: "Chủ đề bạn hay sai", tone: "from-orange-500/20 text-orange-300" },
    { href: "/tin-tuc", icon: <Newspaper className="h-5 w-5" />, title: "Tin tức luật mới", desc: "Đề 2027, mức phạt, 12 điểm", tone: "from-indigo-500/20 text-indigo-300" },
    { href: "/tien-do#bang-lai", icon: <IdCard className="h-5 w-5" />, title: "Bằng lái ảo", desc: "Thẻ thành tích của bạn", tone: "from-amber-500/20 text-amber-300" },
    { href: "/gioi-thieu", icon: <Info className="h-5 w-5" />, title: "Giới thiệu", desc: "Tất cả tính năng của Lái Lụa", tone: "from-white/15 text-white/80" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t) => (
        <Link
          key={t.title}
          href={t.href}
          className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${t.tone} to-asphalt-850 p-4 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:ring-white/25 ${t.big ? "col-span-2 sm:p-6" : ""}`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/30 ring-1 ring-white/10">{t.icon}</span>
          <h2 className={`mt-3 font-bold text-white ${t.big ? "text-xl" : ""}`}>{t.title}</h2>
          <p className="mt-1 text-sm text-white/60">{t.desc}</p>
        </Link>
      ))}
    </div>
  );
}
