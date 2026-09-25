"use client";

import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { LICENSES, TT108_DATE } from "@/data/licenses";
import { useExamVersion, useHydrated, useNow, useProgress } from "@/store/progress";
import { Button } from "@/components/ui/Button";

/** Khối đếm ngược + bảng so sánh đề hiện hành / đề 2027, chỉ hiển thị trong bài viết riêng. */
export function Exam2027Panel() {
  const hydrated = useHydrated();
  const router = useRouter();
  const now = useNow();
  const last = useProgress((s) => s.lastLicense);
  const setVersion = useProgress((s) => s.setExamVersion);
  const version = useExamVersion();
  const days = now ? Math.ceil((TT108_DATE.getTime() - now) / 86_400_000) : null;
  const mine = hydrated ? last : null;

  const practice = () => {
    setVersion("tt108");
    router.push(mine ? `/hang/${mine.toLowerCase()}/bo-de` : "/chon-hang");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-3xl bg-[linear-gradient(120deg,#1e1b4b,#312e81_55%,#4c1d95)] p-5 ring-1 ring-indigo-400/30 sm:flex-row sm:items-center">
        <div className="text-center sm:w-28">
          {days !== null && days > 0 ? (
            <>
              <div className="font-hud text-5xl leading-none text-lane">{days}</div>
              <div className="mt-1 text-[0.6875rem] font-bold uppercase text-white/60">ngày nữa</div>
            </>
          ) : (
            <div className="font-hud text-lg font-bold text-lane">{days === null ? "…" : "Đang áp dụng"}</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Áp dụng từ 01/3/2027</p>
          <p className="mt-1 text-white/80">
            Bạn có thể luyện song song cả hai cấu trúc. Chọn đề phù hợp với ngày thi của bạn — cài đặt này đổi được bất cứ lúc nào trong mục <b>Tôi</b>.
          </p>
        </div>
        <Button onClick={practice} variant={version === "tt108" ? "secondary" : "primary"} iconRight={<ArrowRight className="h-4 w-4" />}>
          {version === "tt108" ? "Vào bộ đề 2027" : "Luyện đề 2027"}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl ring-1 ring-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-white/50">
            <tr>
              <th className="px-3 py-2">Hạng</th>
              <th className="px-3 py-2">Hiện hành</th>
              <th className="px-3 py-2">Từ 01/3/2027</th>
            </tr>
          </thead>
          <tbody>
            {LICENSES.map((l) => (
              <tr key={l.id} className={clsx("border-t border-white/5", l.id === mine && "bg-lane/10")}>
                <td className="px-3 py-2 font-bold text-white">
                  {l.id}
                  {l.id === mine && <span className="ml-2 rounded bg-lane px-1 text-[0.625rem] font-extrabold text-slate-950">BẠN</span>}
                </td>
                <td className="px-3 py-2 text-white/60">
                  {l.exam.total} · {l.exam.minutes}′ · {l.exam.pass}
                </td>
                <td className="px-3 py-2 font-semibold text-white">
                  {l.exam2027.total} · {l.exam2027.minutes}′ · <span className="text-lane">{l.exam2027.pass}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-white/40">Số câu · thời gian (phút) · số câu đúng tối thiểu để đạt. BE, D1E, D2E, DE: tạm tính như CE do chưa có số liệu công bố riêng.</p>
    </div>
  );
}
