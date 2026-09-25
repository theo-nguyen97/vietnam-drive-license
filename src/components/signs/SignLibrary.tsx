"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";
import { SIGNS, SIGN_GROUPS, type SignGroup } from "@/data/signs";
import { TrafficSign } from "./TrafficSign";

export function SignLibrary() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<SignGroup | "all">("all");
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  const list = useMemo(() => {
    const k = norm(q.trim());
    return SIGNS.filter((s) => (group === "all" || s.group === group) && (!k || norm(`${s.code} ${s.name} ${s.meaning}`).includes(k)));
  }, [q, group]);

  return (
    <div>
      <div className="sticky top-[6.5rem] z-20 -mx-4 mb-6 flex flex-col gap-3 bg-asphalt-950/85 px-4 py-3 backdrop-blur md:top-14 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 px-3 ring-1 ring-white/10 focus-within:ring-lane/60">
          <Search className="h-4 w-4 text-white/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm biển: “cấm đỗ”, “P.102”, “trẻ em”…" className="w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-white/30" />
        </label>
        <div className="flex gap-1.5 overflow-x-auto thin-scroll">
          {[{ id: "all" as const, name: "Tất cả" }, ...SIGN_GROUPS].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroup(g.id)}
              className={clsx("shrink-0 rounded-lg px-3 py-2 text-xs font-bold", group === g.id ? "bg-lane text-slate-900" : "bg-white/5 text-white/70 hover:bg-white/10")}
            >
              {g.name.replace("Biển báo ", "").replace("Biển ", "")}
            </button>
          ))}
        </div>
      </div>
      {SIGN_GROUPS.filter((g) => group === "all" || g.id === group).map((g) => {
        const items = list.filter((s) => s.group === g.id);
        if (!items.length) return null;
        return (
          <section key={g.id} className="mb-10">
            <h2 className="text-xl font-bold text-white">{g.name}</h2>
            <p className="mb-4 text-sm text-white/55">{g.desc}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((s) => (
                <article key={s.code} className="flex gap-4 rounded-2xl bg-asphalt-850 p-4 ring-1 ring-white/10">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-white p-2">
                    <TrafficSign code={s.code} size={80} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-hud text-xs font-bold text-lane">{s.code}</div>
                    <h3 className="font-bold leading-snug text-white">{s.name}</h3>
                    <p className="mt-1 text-sm leading-snug text-white/60">{s.meaning}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
      {list.length === 0 && <p className="py-10 text-center text-white/50">Không tìm thấy biển báo phù hợp.</p>}
    </div>
  );
}
