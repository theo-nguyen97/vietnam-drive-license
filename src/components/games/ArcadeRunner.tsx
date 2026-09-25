"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronLeft, Flame, RotateCcw, Timer, Trophy } from "lucide-react";
import clsx from "clsx";
import type { LicenseId, Question } from "@/lib/types";
import { getLicense } from "@/data/licenses";
import { questionsFor } from "@/data/questions";
import { shuffle } from "@/lib/random";
import { sfx } from "@/lib/sound";
import { useHydrated, useProgress } from "@/store/progress";
import { SceneStage, type Outcome } from "@/components/quiz/SceneStage";
import { QuestionView } from "@/components/quiz/QuestionView";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { FontSizeToggle } from "@/components/ui/FontSizeToggle";
import { Button, ButtonLink, iconButtonClass } from "@/components/ui/Button";

const MAX_POINTS = 12;
const TIME = 20;
const PENALTY = 2;
const CRITICAL_PENALTY = 6;

type Phase = "intro" | "play" | "over";

/**
 * Thử thách 12 điểm: chạy liên tục, mỗi câu 20 giây.
 * Trả lời sai/hết giờ bị trừ điểm GPLX như luật mới (câu điểm liệt trừ nặng);
 * 5 câu đúng liên tiếp phục hồi 1 điểm. Hết 12 điểm là bị "tước bằng".
 */
export function ArcadeRunner({ license }: { license: LicenseId }) {
  const lic = getLicense(license)!;
  const hydrated = useHydrated();
  const record = useProgress((s) => s.record);
  const addXp = useProgress((s) => s.addXp);
  const best = useProgress((s) => s.arcadeBest[license] ?? 0);
  const setBest = useProgress((s) => s.setArcadeBest);

  const [phase, setPhase] = useState<Phase>("intro");
  const [queue, setQueue] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [points, setPoints] = useState(MAX_POINTS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [stats, setStats] = useState({ answered: 0, correct: 0, wrong: [] as number[] });
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const [answered, setAnswered] = useState(false);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const [toast, setToast] = useState<{ id: number; text: string; tone: "good" | "bad" } | null>(null);
  const autoNext = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [newBest, setNewBest] = useState(false);

  const q = queue[idx];

  const start = () => {
    setQueue(shuffle(questionsFor(license)));
    setIdx(0);
    setPoints(MAX_POINTS);
    setScore(0);
    setCombo(0);
    setStats({ answered: 0, correct: 0, wrong: [] });
    setSelected(undefined);
    setAnswered(false);
    const n = Date.now();
    setNow(n);
    setDeadline(n + TIME * 1000);
    setPhase("play");
    sfx.engine();
  };

  const flash = (text: string, tone: "good" | "bad") => setToast({ id: Date.now(), text, tone });

  const finish = useCallback(
    (finalScore: number) => {
      setNewBest(finalScore > best);
      setBest(license, finalScore);
      addXp(Math.round(finalScore / 50));
      sfx.lose();
      setPhase("over");
    },
    [best, setBest, license, addXp],
  );

  const next = useCallback(() => {
    if (autoNext.current) clearTimeout(autoNext.current);
    if (points <= 0) {
      finish(score);
      return;
    }
    if (idx + 1 >= queue.length) setQueue((qs) => [...qs, ...shuffle(questionsFor(license))]);
    setIdx(idx + 1);
    setSelected(undefined);
    setAnswered(false);
    const n = Date.now();
    setNow(n);
    setDeadline(n + TIME * 1000);
  }, [points, score, idx, queue.length, license, finish]);

  const answer = useCallback(
    (i: number | undefined) => {
      if (!q || answered) return;
      const ok = i === q.answer;
      const left = Math.max(0, (deadline - Date.now()) / 1000);
      setSelected(i);
      setAnswered(true);
      record(q.id, ok);
      setStats((s) => ({ answered: s.answered + 1, correct: s.correct + (ok ? 1 : 0), wrong: ok ? s.wrong : [...s.wrong, q.id] }));
      if (ok) {
        const c = combo + 1;
        const gain = Math.round((100 + left * 10) * (1 + Math.min(combo, 5) * 0.2));
        setScore((s) => s + gain);
        setCombo(c);
        let msg = `+${gain}`;
        if (c % 5 === 0 && points < MAX_POINTS) {
          setPoints((p) => Math.min(MAX_POINTS, p + 1));
          msg += " · +1 điểm GPLX";
        }
        flash(msg, "good");
        sfx.correct();
        autoNext.current = setTimeout(() => next(), 1500);
      } else {
        const pen = q.critical ? CRITICAL_PENALTY : PENALTY;
        setPoints((p) => Math.max(0, p - pen));
        setCombo(0);
        flash(`${i === undefined ? "Hết giờ! " : ""}−${pen} điểm GPLX`, "bad");
        sfx.wrong();
      }
    },
    [q, answered, deadline, combo, points, record, next],
  );

  // Đồng hồ từng câu: hết giờ thì tính là trả lời sai
  useEffect(() => {
    if (phase !== "play" || answered) return;
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (deadline && n >= deadline) answer(undefined);
    }, 100);
    return () => clearInterval(t);
  }, [phase, answered, deadline, answer]);

  const left = Math.max(0, deadline - now);

  useEffect(() => () => {
    if (autoNext.current) clearTimeout(autoNext.current);
  }, []);

  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!answered && e.key >= "1" && e.key <= "9") answer(Number(e.key) - 1);
      else if (answered && (e.key === "Enter" || e.key === "ArrowRight")) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, answered, answer, next]);

  const base = `/hang/${license.toLowerCase()}`;
  if (!hydrated) return null;

  if (phase === "intro") {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link href={base} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-white/60 hover:text-white">
          <ChevronLeft className="h-4 w-4" /> Hạng {lic.id}
        </Link>
        <div className="overflow-hidden rounded-3xl bg-asphalt-850 ring-1 ring-white/10">
          <div className="hazard-stripes h-3" />
          <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
            <div>
              <p className="font-hud text-sm uppercase tracking-[0.2em] text-lane">Chế độ sinh tồn</p>
              <h1 className="font-display text-3xl text-white sm:text-4xl">Thử thách 12 điểm</h1>
              <p className="mt-3 text-white/70">
                Từ 2025, mỗi giấy phép lái xe có <b className="text-white">12 điểm</b>. Hãy lái qua càng nhiều trạm càng tốt trước khi bị trừ hết điểm!
              </p>
              <ul className="mt-4 space-y-2 text-sm text-white/75">
                <li>⏱️ Mỗi câu {TIME} giây — trả lời càng nhanh càng nhiều điểm thưởng.</li>
                <li>❌ Sai hoặc hết giờ: trừ {PENALTY} điểm GPLX · câu điểm liệt trừ {CRITICAL_PENALTY} điểm.</li>
                <li>🔥 Đúng 5 câu liên tiếp: phục hồi 1 điểm GPLX, combo nhân điểm tới x2.</li>
                <li>🪪 Hết 12 điểm: bị tước bằng — trò chơi kết thúc.</li>
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button size="lg" onClick={start} iconRight={<ArrowRight className="h-5 w-5" />}>
                  Khởi hành
                </Button>
                <span className="font-hud text-sm text-white/60">Kỷ lục: <b className="text-lane">{best.toLocaleString("vi-VN")}</b></span>
              </div>
            </div>
            <LicenseCard license={lic.id} points={MAX_POINTS} color={lic.color} />
          </div>
        </div>
      </div>
    );
  }

  if (phase === "over") {
    return (
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="overflow-hidden rounded-3xl bg-asphalt-850 p-6 text-center ring-1 ring-white/10 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/50">Thử thách 12 điểm · hạng {lic.id}</p>
          <div className="relative mx-auto mt-5 w-fit">
            <LicenseCard license={lic.id} points={0} color={lic.color} />
            <motion.div
              initial={{ scale: 2.5, rotate: -25, opacity: 0 }}
              animate={{ scale: 1, rotate: -12, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.3 }}
              className="absolute inset-0 m-auto flex h-fit w-fit items-center rounded-xl border-[5px] border-red-500 bg-slate-950/70 px-4 py-1 font-display text-2xl text-red-400"
            >
              TƯỚC BẰNG
            </motion.div>
          </div>
          <div className="mt-6 font-hud text-5xl text-white">{score.toLocaleString("vi-VN")}</div>
          <div className="text-sm text-white/55">điểm {newBest && <b className="text-lane">· KỶ LỤC MỚI! 🏆</b>}</div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Tile k="Trạm đã qua" v={`${stats.correct}`} />
            <Tile k="Tổng câu" v={`${stats.answered}`} />
            <Tile k="Kỷ lục" v={Math.max(best, score).toLocaleString("vi-VN")} />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={start} icon={<RotateCcw className="h-4 w-4" />}>
              Thi lại lấy bằng
            </Button>
            {stats.wrong.length > 0 && (
              <ButtonLink href={`${base}/on-tap/cau-sai`} variant="secondary">
                Ôn {stats.wrong.length} câu vừa sai
              </ButtonLink>
            )}
          </div>
          <Link href={base} className="mt-5 inline-block text-sm font-semibold text-white/60 hover:text-white">
            ← Về hạng {lic.id}
          </Link>
        </motion.div>
      </div>
    );
  }

  const outcome: Outcome = answered ? (selected === q.answer ? "correct" : "wrong") : null;
  const frac = left / (TIME * 1000);

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-30 border-b border-white/5 bg-asphalt-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 sm:px-4">
          <Link href={base} className={iconButtonClass()} aria-label="Thoát">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">GPLX</span>
              <Pips points={points} />
              <span className="font-hud text-sm text-white">{points}/12</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Timer className="h-3.5 w-3.5 text-white/50" />
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className={clsx("h-full rounded-full transition-[width] duration-100 ease-linear", frac > 0.5 ? "bg-green-500" : frac > 0.25 ? "bg-amber-400" : "bg-red-500")}
                  style={{ width: `${(answered ? 0 : frac) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right font-hud text-xs text-white/70">{Math.ceil(left / 1000)}s</span>
            </div>
          </div>
          {combo >= 2 && (
            <span className="flex items-center gap-1 rounded-xl bg-orange-500/20 px-2 py-1.5 font-hud text-sm text-orange-300 ring-1 ring-orange-400/40">
              <Flame className="h-4 w-4" />x{combo}
            </span>
          )}
          <div className="rounded-xl bg-lane/15 px-3 py-1.5 font-hud text-lg text-lane ring-1 ring-lane/30">{score.toLocaleString("vi-VN")}</div>
          <FontSizeToggle />
          <SoundToggle />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-5 px-3 py-4 sm:px-4 lg:grid-cols-[1.25fr_1fr] lg:py-6">
        <div className="relative lg:sticky lg:top-24 lg:self-start">
          <SceneStage key={`${q.id}-${idx}`} q={q} number={stats.answered + (answered ? 0 : 1)} vehicle={lic.vehicle} outcome={outcome} mode="practice" />
          <AnimatePresence>
            {toast && (
              <motion.div
                key={toast.id}
                initial={{ y: 0, opacity: 1, scale: 0.8 }}
                animate={{ y: -30, opacity: 0, scale: 1.1 }}
                transition={{ duration: 1.6 }}
                onAnimationComplete={() => setToast(null)}
                className={clsx(
                  "pointer-events-none absolute inset-x-0 bottom-6 mx-auto w-fit rounded-xl px-3 py-1 font-hud text-xl",
                  toast.tone === "good" ? "bg-green-500 text-white" : "bg-red-600 text-white",
                )}
              >
                {toast.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-col gap-4 pb-24 lg:pb-0">
          <QuestionView
            q={q}
            number={stats.answered + (answered ? 0 : 1)}
            total={0}
            selected={selected}
            reveal={answered}
            onSelect={answered ? undefined : (i) => answer(i)}
            showExplanation={answered && selected !== q.answer}
          />
          {answered && (
            <div className="flex justify-end">
              <Button onClick={next} iconRight={<ArrowRight className="h-4 w-4" />}>
                {points <= 0 ? "Xem kết quả" : "Trạm tiếp theo"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Pips({ points }: { points: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${points} điểm GPLX`}>
      {Array.from({ length: MAX_POINTS }, (_, i) => (
        <motion.span
          key={i}
          animate={{ scale: i < points ? 1 : 0.7, opacity: i < points ? 1 : 0.25 }}
          className={clsx("h-3 w-2 rounded-[3px] sm:w-2.5", i < points ? (points <= 4 ? "bg-red-500" : points <= 8 ? "bg-amber-400" : "bg-green-500") : "bg-white/30")}
        />
      ))}
    </div>
  );
}

function Tile({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
      <div className="font-hud text-xl text-white">{v}</div>
      <div className="text-xs text-white/50">{k}</div>
    </div>
  );
}

/** Thẻ GPLX mini dùng cho thử thách. */
export function LicenseCard({ license, points, color }: { license: LicenseId; points: number; color: string }) {
  return (
    <div className="relative h-40 w-64 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#fde7ef,#dbeafe_55%,#e0e7ff)] p-3 text-slate-800 shadow-2xl ring-1 ring-white/40">
      <div className="text-[0.5rem] font-bold uppercase leading-tight text-slate-600">Cộng hoà xã hội chủ nghĩa Việt Nam</div>
      <div className="text-[0.6875rem] font-extrabold uppercase text-red-700">Giấy phép lái xe</div>
      <div className="mt-2 flex gap-3">
        <div className="flex h-16 w-12 items-center justify-center rounded-md bg-slate-300 text-2xl">🧑</div>
        <div className="text-[0.625rem] leading-4">
          <div>
            Hạng: <b className="rounded px-1 text-white" style={{ background: color }}>{license}</b>
          </div>
          <div>Điểm GPLX:</div>
          <div className="font-hud text-2xl leading-none" style={{ color: points > 4 ? "#15803d" : "#b91c1c" }}>
            {points}/12
          </div>
        </div>
      </div>
      <Trophy className="absolute bottom-2 right-2 h-5 w-5 text-slate-400/60" />
    </div>
  );
}
