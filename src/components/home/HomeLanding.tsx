import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { LICENSES } from "@/data/licenses";
import { QUESTIONS } from "@/data/questions";

/**
 * Phần giới thiệu tĩnh của trang chủ — được kết xuất sẵn trên máy chủ để công cụ tìm kiếm
 * đọc được nội dung (trang học theo hạng chỉ hiện sau khi trình duyệt nạp tiến độ).
 * Người đã chọn hạng không nhìn thấy khối này (ẩn bằng `html[data-returning]`).
 */
export function HomeLanding({ headingLevel = 1 }: { headingLevel?: 1 | 2 }) {
  const H = headingLevel === 1 ? "h1" : "h2";
  const junctions = QUESTIONS.filter((q) => q.scene?.kind === "junction").length;
  return (
    <div className="home-landing mx-auto w-full max-w-4xl px-4 pb-16 pt-8 sm:pt-12">
      <div className="flex justify-center">
        <Logo />
      </div>
      <H className="mt-6 text-center font-display text-3xl leading-tight text-white sm:text-5xl">
        Ôn thi lý thuyết bằng lái xe <span className="text-lane">như chơi game</span>
      </H>
      <p className="mx-auto mt-4 max-w-2xl text-center text-white/70 sm:text-lg">
        Thi thử miễn phí theo cấu trúc đề Thông tư 12/2025 và đề mới từ 01/3/2027, {QUESTIONS.length} câu hỏi có giải thích, {junctions} sa hình
        chuyển động, ôn tập ngắt quãng và chẩn đoán điểm yếu — lưu tiến độ ngay trên trình duyệt, không cần đăng ký.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/chon-hang" size="lg">
          Chọn hạng bằng để bắt đầu
        </ButtonLink>
        <ButtonLink href="/gioi-thieu" variant="secondary" size="lg">
          Xem giới thiệu
        </ButtonLink>
      </div>

      <h2 className="mt-12 text-center text-lg font-bold text-white">Hạng giấy phép lái xe có trong Lái Lụa</h2>
      <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {LICENSES.map((l) => (
          <li key={l.id}>
            <Link
              href={`/hang/${l.id.toLowerCase()}`}
              className="block rounded-2xl bg-asphalt-850 p-3 text-center ring-1 ring-white/10 transition hover:ring-white/30"
            >
              <span className="font-display text-xl text-white">{l.id}</span>
              <span className="mt-0.5 block text-[0.6875rem] leading-snug text-white/55">{l.short}</span>
            </Link>
          </li>
        ))}
      </ul>

      <nav aria-label="Nội dung khác" className="mt-10 grid gap-3 text-sm sm:grid-cols-3">
        <Link href="/bien-bao" className="rounded-2xl bg-asphalt-850 p-4 ring-1 ring-white/10 hover:ring-white/30">
          <span className="block font-bold text-white">Thư viện biển báo</span>
          <span className="text-white/55">Biển cấm, nguy hiểm, hiệu lệnh, chỉ dẫn, phụ, vạch kẻ đường theo QCVN 41.</span>
        </Link>
        <Link href="/tin-tuc" className="rounded-2xl bg-asphalt-850 p-4 ring-1 ring-white/10 hover:ring-white/30">
          <span className="block font-bold text-white">Tin tức luật giao thông</span>
          <span className="text-white/55">Đề thi 2027, mức phạt, trừ điểm GPLX, nồng độ cồn, tốc độ.</span>
        </Link>
        <Link href="/lo-trinh" className="rounded-2xl bg-asphalt-850 p-4 ring-1 ring-white/10 hover:ring-white/30">
          <span className="block font-bold text-white">Lộ trình lấy bằng</span>
          <span className="text-white/55">Từ hồ sơ đến nhận bằng, hướng dẫn 11 bài sa hình ô tô và 4 bài xe máy.</span>
        </Link>
      </nav>
    </div>
  );
}
