"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Download, Upload, Trash2, Flame, Target, Trophy, Zap } from "lucide-react";
import clsx from "clsx";
import { LICENSES } from "@/data/licenses";
import { CHAPTERS } from "@/data/chapters";
import { QUESTIONS } from "@/data/questions";
import { activeStreak, useHydrated, useProgress } from "@/store/progress";
import { licenseProgress } from "@/lib/stats";
import { rankOf, RANKS } from "@/lib/rank";
import { Button } from "@/components/ui/Button";

export function ProgressDashboard() {
  const hydrated = useHydrated();
  const s = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!hydrated) return <div className="h-96 animate-pulse rounded-3xl bg-white/5" />;

  const r = rankOf(s.xp);
  const entries = Object.entries(s.stats);
  const answered = entries.length;
  const totalC = entries.reduce((a, [, v]) => a + v.c, 0);
  const totalW = entries.reduce((a, [, v]) => a + v.w, 0);
  const acc = totalC + totalW ? totalC / (totalC + totalW) : 0;
  const days = activeStreak(s.streak);

  const chapterAcc = CHAPTERS.map((c) => {
    const qs = QUESTIONS.filter((q) => q.chapter === c.id);
    let cc = 0;
    let ww = 0;
    qs.forEach((q) => {
      const st = s.stats[q.id];
      if (st) {
        cc += st.c;
        ww += st.w;
      }
    });
    return { c, acc: cc + ww ? cc / (cc + ww) : null, attempts: cc + ww };
  });

  const started = LICENSES.map((l) => ({ l, p: licenseProgress(l.id, s.stats, s.exams) })).filter((x) => x.p.seen > 0 || x.p.exams > 0);

  const exportData = () => {
    const data = JSON.stringify({ app: "lai-lua", version: 1, exportedAt: new Date().toISOString(), state: { stats: s.stats, exams: s.exams, xp: s.xp, streak: s.streak, bestCombo: s.bestCombo, bookmarks: s.bookmarks } }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `lai-lua-tien-do-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importData = async (f: File) => {
    const ok = s.importData(await f.text());
    setMsg(ok ? "Đã nhập tiến độ thành công!" : "Tệp không hợp lệ.");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hồ sơ tay lái */}
      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-asphalt-850 p-6 ring-1 ring-white/10">
          <div className="absolute -right-10 -top-10 text-[10rem] opacity-10">{r.icon}</div>
          <p className="font-hud text-sm font-bold uppercase tracking-[0.2em] text-lane">Hồ sơ tay lái</p>
          <div className="mt-2 flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lane/15 text-4xl ring-1 ring-lane/30">{r.icon}</span>
            <div>
              <div className="font-display text-2xl text-white">{r.name}</div>
              <div className="text-sm text-white/60">
                Cấp {r.level} · <span className="font-hud font-bold text-lane">{s.xp} XP</span>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex justify-between text-xs text-white/50">
              <span>{r.name}</span>
              <span>{r.next ? `${r.next.name} (${r.next.xp} XP)` : "Cấp tối đa"}</span>
            </div>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-lane" style={{ width: `${r.progress * 100}%` }} />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {RANKS.map((x, i) => (
              <span key={x.name} className={clsx("rounded-lg px-2 py-1 text-xs font-semibold ring-1", i < r.level ? "bg-lane/15 text-lane ring-lane/30" : "bg-white/5 text-white/30 ring-white/10")}>
                {x.icon} {x.name}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Tile icon={<Flame className="h-5 w-5" />} k="Chuỗi ngày học" v={`${days} ngày`} tone="text-orange-300" />
          <Tile icon={<Target className="h-5 w-5" />} k="Độ chính xác" v={`${Math.round(acc * 100)}%`} tone="text-green-300" />
          <Tile icon={<Zap className="h-5 w-5" />} k="Combo cao nhất" v={`x${s.bestCombo}`} tone="text-sky-300" />
          <Tile icon={<Trophy className="h-5 w-5" />} k="Câu đã làm" v={`${answered}/${QUESTIONS.length}`} tone="text-violet-300" />
        </div>
      </section>

      {/* Theo hạng */}
      <section className="rounded-3xl bg-asphalt-850 p-6 ring-1 ring-white/10">
        <h2 className="text-lg font-bold text-white">Mức sẵn sàng theo hạng bằng</h2>
        {started.length === 0 ? (
          <p className="mt-2 text-white/60">
            Bạn chưa bắt đầu hạng nào. <Link href="/#hang-bang" className="text-lane underline">Chọn hạng bằng</Link> để khởi hành!
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {started.map(({ l, p }) => (
              <Link key={l.id} href={`/hang/${l.id.toLowerCase()}`} className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-white/5">
                <span className="flex h-10 w-12 items-center justify-center rounded-xl font-display text-slate-900" style={{ background: l.color }}>
                  {l.id}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-white">{l.short}</span>
                    <span className="font-hud text-white/60">
                      {p.mastered}/{p.total} · thi đạt {p.passed}/{p.exams}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${p.pct * 100}%`, background: l.color }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Theo chương */}
      <section className="rounded-3xl bg-asphalt-850 p-6 ring-1 ring-white/10">
        <h2 className="text-lg font-bold text-white">Độ chính xác theo chương</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {chapterAcc.map(({ c, acc, attempts }) => (
            <div key={c.id} className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-white">
                  {c.icon} {c.short}
                </span>
                <span className="font-hud text-white/60">{acc === null ? "chưa làm" : `${Math.round(acc * 100)}% · ${attempts} lượt`}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={clsx("h-full rounded-full", acc === null ? "" : acc >= 0.9 ? "bg-green-500" : acc >= 0.7 ? "bg-amber-400" : "bg-red-500")}
                  style={{ width: `${(acc ?? 0) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lịch sử thi */}
      <section className="rounded-3xl bg-asphalt-850 p-6 ring-1 ring-white/10">
        <h2 className="text-lg font-bold text-white">Lịch sử thi thử</h2>
        {s.exams.length === 0 ? (
          <p className="mt-2 text-white/60">Chưa có bài thi nào.</p>
        ) : (
          <div className="mt-3 overflow-x-auto thin-scroll">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-white/40">
                <tr>
                  <th className="py-2">Thời điểm</th>
                  <th>Hạng</th>
                  <th>Kết quả</th>
                  <th>Thời gian</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {s.exams.slice(0, 20).map((e) => (
                  <tr key={e.id} className="border-t border-white/5">
                    <td className="py-2 text-white/60">{new Date(e.at).toLocaleString("vi-VN")}</td>
                    <td className="font-display text-white">{e.license}</td>
                    <td className="font-hud font-bold text-white">
                      {e.correct}/{e.total}
                    </td>
                    <td className="font-hud text-white/60">
                      {Math.floor(e.duration / 60)}:{String(e.duration % 60).padStart(2, "0")}
                    </td>
                    <td>
                      <span className={clsx("rounded-md px-2 py-0.5 text-xs font-bold", e.passed ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300")}>
                        {e.passed ? "ĐẠT" : e.criticalFail ? "TRƯỢT · điểm liệt" : "TRƯỢT"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Sao lưu */}
      <section className="rounded-3xl bg-asphalt-850 p-6 ring-1 ring-white/10">
        <h2 className="text-lg font-bold text-white">Sao lưu tiến độ</h2>
        <p className="mt-1 text-sm text-white/60">Tiến độ được lưu tự động trên trình duyệt này. Xuất tệp để chuyển sang máy khác.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={exportData} icon={<Download className="h-4 w-4" />}>
            Xuất tệp
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()} icon={<Upload className="h-4 w-4" />}>
            Nhập tệp
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importData(f);
              e.target.value = "";
            }}
          />
          {confirmReset ? (
            <span className="flex items-center gap-2">
              <span className="text-sm text-red-300">Xoá toàn bộ tiến độ?</span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  s.reset();
                  setConfirmReset(false);
                  setMsg("Đã xoá tiến độ.");
                }}
              >
                Xoá
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmReset(false)}>
                Huỷ
              </Button>
            </span>
          ) : (
            <Button variant="ghost" onClick={() => setConfirmReset(true)} className="text-red-300 hover:text-red-200" icon={<Trash2 className="h-4 w-4" />}>
              Xoá tiến độ
            </Button>
          )}
        </div>
        {msg && <p className="mt-3 text-sm text-lane">{msg}</p>}
      </section>
    </div>
  );
}

function Tile({ icon, k, v, tone }: { icon: React.ReactNode; k: string; v: string; tone: string }) {
  return (
    <div className="flex flex-col justify-between rounded-3xl bg-asphalt-850 p-4 ring-1 ring-white/10">
      <span className={tone}>{icon}</span>
      <div className="mt-3">
        <div className="font-hud text-2xl font-bold text-white">{v}</div>
        <div className="text-xs text-white/50">{k}</div>
      </div>
    </div>
  );
}
