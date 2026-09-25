import { BookOpen, ClipboardCheck, Compass, Newspaper, UserRound } from "lucide-react";
import type { LicenseId } from "@/lib/types";

const EXPLORE = ["/kham-pha", "/lo-trinh", "/bien-bao", "/san-bien-bao", "/gioi-thieu"];

/** 5 mục điều hướng chính dùng chung cho header (desktop) và thanh tab (mobile). */
export function navItems(path: string, last: LicenseId | null) {
  const base = last ? `/hang/${last.toLowerCase()}` : null;
  const isExam = /^\/hang\/[^/]+\/(bo-de|thi-thu)/.test(path);
  return [
    { href: "/", label: "Học", icon: BookOpen, active: path === "/" || (path.startsWith("/hang/") && !isExam) },
    { href: base ? `${base}/bo-de` : "/chon-hang", label: "Thi thử", icon: ClipboardCheck, active: isExam },
    { href: "/tin-tuc", label: "Tin tức", icon: Newspaper, active: path.startsWith("/tin-tuc") },
    { href: "/kham-pha", label: "Khám phá", icon: Compass, active: EXPLORE.some((p) => path.startsWith(p)) },
    { href: "/tien-do", label: "Tôi", icon: UserRound, active: path.startsWith("/tien-do") || path.startsWith("/chon-hang") },
  ];
}
