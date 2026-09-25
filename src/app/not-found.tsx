import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <svg viewBox="0 0 100 100" width={120} height={120} aria-hidden>
        <circle cx={50} cy={50} r={47} fill="#d7191f" stroke="#fff" strokeWidth={2} />
        <rect x={17} y={41} width={66} height={18} fill="#fff" />
      </svg>
      <h1 className="font-display text-3xl text-white">Đường cấm!</h1>
      <p className="text-white/60">Trang bạn tìm không tồn tại hoặc đã đổi hướng.</p>
      <Link href="/" className="rounded-xl bg-lane px-5 py-2.5 font-bold text-slate-900">
        Quay đầu về trang chủ
      </Link>
    </main>
  );
}
