"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";
import type { LicenseId } from "@/lib/types";
import { TT108_DATE, getLicense } from "@/data/licenses";
import { useExamVersion, useHydrated, useNow, useProgress } from "@/store/progress";
import { Button } from "./Button";

/** Băng rôn đếm ngược đến ngày áp dụng cấu trúc đề mới (01/3/2027). */
export function ExamChangeBanner({ license }: { license?: LicenseId }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const last = useProgress((s) => s.lastLicense);
  const setVersion = useProgress((s) => s.setExamVersion);
  const version = useExamVersion();
  const now = useNow();
  if (!hydrated || !now) return null;

  const days = Math.ceil((TT108_DATE.getTime() - now) / 86_400_000);
  const target = license ?? last ?? "B";
  const lic = getLicense(target)!;
  const applied = days <= 0;

  const go = () => {
    setVersion("tt108");
    router.push(license || last ? `/hang/${target.toLowerCase()}/bo-de` : "/#hang-bang");
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#1e1b4b,#312e81_55%,#4c1d95)] p-4 ring-1 ring-indigo-400/30 sm:p-5">
      <div className="hazard-stripes absolute inset-y-0 right-0 w-3 opacity-60" />
      <div className="flex flex-col gap-4 pr-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lane text-slate-950">
            <Megaphone className="h-6 w-6" />
          </span>
          {!applied && (
            <div className="text-center sm:hidden">
              <div className="font-hud text-3xl leading-none text-lane">{days}</div>
              <div className="text-[0.625rem] font-bold uppercase text-white/60">ngày nữa</div>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Thông tư 108/2026/TT-BCA</p>
          <p className="mt-0.5 font-bold text-white">
            {applied ? "Đề lý thuyết mới đang được áp dụng" : "Từ 01/3/2027 đề lý thuyết thay đổi"}: hạng {lic.id} {lic.exam.total} → <b className="text-lane">{lic.exam2027.total} câu</b>, phải đúng{" "}
            <b className="text-lane">{lic.exam2027.pass}</b> câu trong {lic.exam2027.minutes} phút.
          </p>
          <p className="mt-0.5 text-sm text-white/65">
            Thêm nội dung xử phạt, trách nhiệm hình sự, phòng chống rượu bia.{" "}
            <Link href="/lo-trinh" className="font-semibold text-indigo-200 underline-offset-2 hover:underline">
              Xem lộ trình lấy bằng →
            </Link>
          </p>
        </div>
        {!applied && (
          <div className="hidden text-center sm:block">
            <div className="font-hud text-4xl leading-none text-lane">{days}</div>
            <div className="text-[0.625rem] font-bold uppercase text-white/60">ngày nữa</div>
          </div>
        )}
        <Button onClick={go} size="sm" variant={version === "tt108" ? "secondary" : "primary"}>
          {version === "tt108" ? "Đang luyện đề 2027" : "Luyện đề 2027"}
        </Button>
      </div>
    </div>
  );
}
