"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { LICENSES } from "@/data/licenses";
import { useProgress, activeStreak } from "@/store/progress";
import { rankOf } from "@/lib/rank";
import { Button } from "@/components/ui/Button";

const W = 540;
const H = 340;
const FONT = "Arial, Helvetica, sans-serif";

/** Bằng lái ảo (vui) — tổng hợp thành tích, có thể tải về ảnh PNG. Không có giá trị pháp lý. */
export function VirtualLicense() {
  const svgRef = useRef<SVGSVGElement>(null);
  const name = useProgress((s) => s.driverName);
  const setName = useProgress((s) => s.setDriverName);
  const xp = useProgress((s) => s.xp);
  const exams = useProgress((s) => s.exams);
  const streak = useProgress((s) => s.streak);
  const [busy, setBusy] = useState(false);

  const r = rankOf(xp);
  const passed = LICENSES.filter((l) => exams.some((e) => e.license === l.id && e.passed));
  const firstPass = exams.filter((e) => e.passed).reduce((m, e) => Math.min(m, e.at), Infinity);
  const serial = `LL-${String((xp * 7919 + passed.length * 104729) % 1_000_000).padStart(6, "0")}`;
  const display = (name.trim() || "Tay lái mới").toUpperCase();

  const download = async () => {
    const svg = svgRef.current;
    if (!svg) return;
    setBusy(true);
    try {
      // Firefox không vẽ SVG thiếu width/height vào canvas → thêm kích thước nội tại.
      const xml = new XMLSerializer().serializeToString(svg).replace("<svg ", `<svg width="${W}" height="${H}" `);
      const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
      const img = new Image();
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("load"));
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "bang-lai-ao-lai-lua.png";
      a.click();
    } catch {
      window.alert("Không tạo được ảnh trên trình duyệt này. Bạn có thể chụp màn hình thẻ bằng lái để chia sẻ.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,540px)_1fr]">
      <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[540px] rounded-[22px] shadow-2xl" role="img" aria-label="Bằng lái ảo">
        <defs>
          <linearGradient id="vl-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fde2ec" />
            <stop offset="0.55" stopColor="#dbeafe" />
            <stop offset="1" stopColor="#e0e7ff" />
          </linearGradient>
          <clipPath id="vl-clip">
            <rect width={W} height={H} rx={22} />
          </clipPath>
        </defs>
        <g clipPath="url(#vl-clip)">
          <rect width={W} height={H} fill="url(#vl-bg)" />
          {/* hoa văn */}
          <g fill="none" stroke="#c7d2fe" strokeWidth={1}>
            {Array.from({ length: 14 }, (_, i) => (
              <circle key={i} cx={430} cy={250} r={20 + i * 14} opacity={0.7} />
            ))}
          </g>
          <rect width={W} height={52} fill="#1e3a8a" />
          <rect y={52} width={W} height={5} fill="#ffd23f" />
          <text x={24} y={24} fontSize={11} fontWeight={700} fill="#bfdbfe" fontFamily={FONT} letterSpacing={1}>
            LÁI LỤA · GIẤY PHÉP LÁI XE ẢO
          </text>
          <text x={24} y={42} fontSize={17} fontWeight={900} fill="#fff" fontFamily={FONT} fontStyle="italic">
            DRIVING GAME LICENSE
          </text>
          <g transform="translate(502 10)">
            <rect width={22} height={34} rx={5} fill="#0f172a" />
            <circle cx={11} cy={8} r={4.5} fill="#ef4444" />
            <circle cx={11} cy={17} r={4.5} fill="#f59e0b" />
            <circle cx={11} cy={26} r={4.5} fill="#22c55e" />
          </g>
          <text x={W - 50} y={42} textAnchor="end" fontSize={12} fontWeight={700} fill="#fde68a" fontFamily={FONT}>
            {serial}
          </text>

          {/* ảnh đại diện */}
          <rect x={24} y={76} width={108} height={136} rx={12} fill="#1e293b" />
          <text x={78} y={150} textAnchor="middle" fontSize={58} fontWeight={900} fill="#ffd23f" fontFamily={FONT}>
            {display.charAt(0)}
          </text>
          <text x={78} y={196} textAnchor="middle" fontSize={24} fontFamily={FONT}>
            {r.icon}
          </text>

          {/* thông tin */}
          <Field x={150} y={88} k="Họ tên / Name" v={display} big />
          <Field x={150} y={134} k="Cấp bậc / Rank" v={`${r.name} · Cấp ${r.level}`} />
          <Field x={150} y={176} k="Kinh nghiệm" v={`${xp.toLocaleString("vi-VN")} XP`} />
          <Field x={330} y={176} k="Chuỗi ngày học" v={`${activeStreak(streak)} ngày`} />
          <Field x={330} y={218} k="Đạt thi thử từ" v={Number.isFinite(firstPass) ? new Date(firstPass).toLocaleDateString("vi-VN") : "—"} />

          <text x={24} y={250} fontSize={10} fontWeight={700} fill="#475569" fontFamily={FONT} letterSpacing={0.5}>
            HẠNG ĐÃ ĐẠT THI THỬ
          </text>
          {passed.length === 0 ? (
            <text x={24} y={276} fontSize={13} fill="#64748b" fontFamily={FONT} fontStyle="italic">
              Chưa có — hãy vượt qua một đề thi thử!
            </text>
          ) : (
            passed.map((l, i) => (
              <g key={l.id} transform={`translate(${24 + i * 58} 258)`}>
                <rect width={52} height={28} rx={7} fill={l.color} />
                <text x={26} y={19} textAnchor="middle" fontSize={14} fontWeight={900} fill="#0f172a" fontFamily={FONT}>
                  {l.id}
                </text>
              </g>
            ))
          )}

          <rect y={H - 32} width={W} height={32} fill="#0f172a" opacity={0.9} />
          <text x={W / 2} y={H - 12} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fca5a5" fontFamily={FONT} letterSpacing={1}>
            BẰNG LÁI ẢO TRONG TRÒ CHƠI · KHÔNG CÓ GIÁ TRỊ PHÁP LÝ
          </text>
        </g>
      </svg>
      <div className="flex max-w-sm flex-col gap-3">
        <label className="text-sm font-semibold text-white/70" htmlFor="driver-name">
          Tên in trên bằng
        </label>
        <input
          id="driver-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={32}
          placeholder="Nhập tên của bạn"
          className="rounded-2xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-2 focus:ring-lane/60"
        />
        <Button variant="secondary" onClick={download} disabled={busy} icon={<Download className="h-4 w-4" />}>
          Tải ảnh bằng lái
        </Button>
        <p className="text-xs text-white/45">Vượt qua đề thi thử của hạng nào thì hạng đó được in lên bằng. Chỉ để vui và khoe tiến độ!</p>
      </div>
    </div>
  );
}

function Field({ x, y, k, v, big }: { x: number; y: number; k: string; v: string; big?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <text fontSize={9.5} fontWeight={700} fill="#64748b" fontFamily={FONT} letterSpacing={0.5}>
        {k.toUpperCase()}
      </text>
      <text y={big ? 24 : 20} fontSize={big ? 22 : 15} fontWeight={900} fill="#0f172a" fontFamily={FONT}>
        {v}
      </text>
    </g>
  );
}
