import { ButtonLink } from "@/components/ui/Button";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { HeroDemo } from "@/components/home/HeroDemo";
import { HeroRoad } from "@/components/home/HeroRoad";
import { LicenseGarage } from "@/components/home/LicenseGarage";
import { ContinueButton } from "@/components/home/ContinueButton";
import { QUESTIONS } from "@/data/questions";
import { LICENSES } from "@/data/licenses";

export default function Home() {
  const junctions = QUESTIONS.filter((q) => q.scene?.kind === "junction").length;
  const critical = QUESTIONS.filter((q) => q.critical).length;
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-10 pt-10 lg:grid-cols-[1fr_1.1fr] lg:pt-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 ring-1 ring-white/10">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" /> Cập nhật theo Luật TTATGT đường bộ 2024
            </span>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] text-white sm:text-5xl lg:text-[3.35rem]">
              Ôn thi bằng lái
              <br />
              <span className="text-lane">như chơi game</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/70">
              Mỗi câu hỏi là một <b className="text-white">trạm kiểm tra</b> trên đường. Trả lời đúng để barie mở, sai thì… bị thổi còi! Sa hình
              chuyển động, giải thích chi tiết và tiến độ được lưu lại cho từng hạng bằng.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ContinueButton />
              <ButtonLink href="/bien-bao" variant="secondary" size="lg">
                Tra cứu biển báo
              </ButtonLink>
            </div>
            <dl className="mt-8 grid max-w-lg grid-cols-4 gap-3">
              {[
                [QUESTIONS.length, "câu hỏi"],
                [junctions, "sa hình động"],
                [critical, "câu điểm liệt"],
                [LICENSES.length, "hạng bằng"],
              ].map(([n, l]) => (
                <div key={l as string} className="rounded-2xl bg-white/5 p-3 text-center ring-1 ring-white/10">
                  <dt className="font-hud text-2xl font-bold text-white">{n}</dt>
                  <dd className="text-[11px] leading-tight text-white/50">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroDemo />
        </section>

        <div className="mx-auto max-w-6xl px-4">
          <HeroRoad />
        </div>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["🚗", "Chọn xe của bạn", "Mỗi hạng bằng là một chiếc xe khác nhau — từ xe tay ga A1 đến đầu kéo container CE."],
              ["🚦", "Vượt từng trạm", "Chế độ ôn tập theo chương: trả lời ngay có giải thích, mẹo nhớ và mô phỏng sa hình."],
              ["🏁", "Thi thử lấy bằng", "Đề ngẫu nhiên đúng số câu, thời gian, điểm đạt và luật câu điểm liệt như thi thật."],
            ].map(([icon, title, desc], i) => (
              <div key={title} className="relative overflow-hidden rounded-3xl bg-asphalt-850 p-6 ring-1 ring-white/10">
                <span className="absolute right-4 top-3 font-display text-5xl text-white/5">0{i + 1}</span>
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-3 text-lg font-bold text-white">{title}</h3>
                <p className="mt-1 text-sm text-white/60">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="hang-bang" className="mx-auto max-w-6xl scroll-mt-24 px-4">
          <div className="mb-6">
            <p className="font-hud text-sm font-bold uppercase tracking-[0.2em] text-lane">Garage</p>
            <h2 className="font-display text-3xl text-white">Chọn hạng bằng</h2>
            <p className="mt-1 text-white/60">Theo phân hạng giấy phép lái xe áp dụng từ 01/01/2025.</p>
          </div>
          <LicenseGarage />
        </section>
      </main>
      <Footer />
    </>
  );
}
