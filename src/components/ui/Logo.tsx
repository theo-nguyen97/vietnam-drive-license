import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Lái Lụa — Trang chủ">
      <span className="flex h-9 w-5 flex-col items-center justify-center gap-[3px] rounded-md bg-slate-900 ring-1 ring-white/15">
        <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
        <span className="h-2 w-2 rounded-full bg-amber-400/40" />
        <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e] transition group-hover:bg-green-400" />
      </span>
      {!compact && (
        <span className="font-display text-lg leading-none tracking-wide text-white">
          LÁI <span className="text-lane">LỤA</span>
        </span>
      )}
    </Link>
  );
}
