"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { Pin } from "lucide-react";
import { NEWS_CATEGORIES, SORTED_NEWS, type NewsCategory } from "@/data/news";

export function NewsList() {
  const [cat, setCat] = useState<NewsCategory | null>(null);
  const items = SORTED_NEWS.filter((n) => !cat || n.category === cat);
  const [first, ...rest] = items;
  return (
    <div>
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {[null, ...NEWS_CATEGORIES].map((c) => (
          <button
            key={c ?? "all"}
            type="button"
            onClick={() => setCat(c)}
            className={clsx(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition",
              cat === c ? "bg-lane text-slate-950 ring-lane" : "bg-white/5 text-white/70 ring-white/10 hover:bg-white/10",
            )}
          >
            {c ?? "Tất cả"}
          </button>
        ))}
      </div>

      {first && (
        <Link
          href={`/tin-tuc/${first.slug}`}
          className="group mb-4 flex flex-col gap-4 rounded-3xl bg-asphalt-850 p-5 ring-1 ring-white/10 transition hover:ring-white/25 sm:flex-row sm:items-center"
        >
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-lane/15 text-5xl ring-1 ring-lane/30">{first.emoji}</span>
          <div className="min-w-0">
            <Meta category={first.category} date={first.date} pinned={first.pinned} />
            <h2 className="mt-1.5 font-display text-xl leading-snug text-white group-hover:text-lane sm:text-2xl">{first.title}</h2>
            <p className="mt-1.5 text-white/60">{first.summary}</p>
          </div>
        </Link>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {rest.map((n) => (
          <Link key={n.slug} href={`/tin-tuc/${n.slug}`} className="group flex gap-4 rounded-3xl bg-asphalt-850 p-4 ring-1 ring-white/10 transition hover:bg-asphalt-800 hover:ring-white/20">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-2xl">{n.emoji}</span>
            <div className="min-w-0">
              <Meta category={n.category} date={n.date} pinned={n.pinned} />
              <h3 className="mt-1 font-bold leading-snug text-white group-hover:text-lane">{n.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-white/55">{n.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Meta({ category, date, pinned }: { category: string; date: string; pinned?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {pinned && (
        <span className="flex items-center gap-1 rounded-md bg-lane/15 px-1.5 py-0.5 font-bold text-lane">
          <Pin className="h-3 w-3" /> Ghim
        </span>
      )}
      <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-semibold text-white/70">{category}</span>
      <span className="text-white/40">{date}</span>
    </div>
  );
}
