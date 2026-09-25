"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Flame, RotateCcw, Timer } from "lucide-react";
import clsx from "clsx";
import { SIGNS, type SignInfo } from "@/data/signs";
import { shuffle } from "@/lib/random";
import { sfx } from "@/lib/sound";
import { useHydrated, useProgress } from "@/store/progress";
import { TrafficSign } from "@/components/signs/TrafficSign";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SoundToggle } from "@/components/ui/SoundToggle";

const ROUND = 60;

interface Card {
  sign: SignInfo;
  options: SignInfo[];
}

function makeCard(prev?: SignInfo): Card {
  const pool = SIGNS.filter((s) => s.code !== prev?.code);
  const sign = pool[Math.floor(Math.random() * pool.length)];
  const same = shuffle(SIGNS.filter((s) => s.group === sign.group && s.code !== sign.code));
  const other = shuffle(SIGNS.filter((s) => s.group !== sign.group));
  const distract = [...same.slice(0, 2), ...other].slice(0, 3);
  return { sign, options: shuffle([sign, ...distract]) };
}

/** Mini-game: nhận diện biển báo nhanh trong 60 giây. */
export function SignHunt() {
  const hydrated = useHydrated();
  const best = useProgress((s) => s.signBest);
  const setBest = useProgress((s) => s.setSignBest);
  const addXp = useProgress((s) => s.addXp);

  const [phase, setPhase] = useState<"intro" | "play" | "over">("intro");
  const [card, setCard] = useState<Card | null>(null);
  const [n, setN] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [right, setRight] = useState(0);
  const [missed, setMissed] = useState<SignInfo[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [endAt, setEndAt] = useState(0);
  const [now, setNow] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const lock = useRef(false);
  const scoreRef = useRef(0);

  const start = () => {
    setCard(makeCard());
    setN(1);
    setScore(0);
    scoreRef.current = 0;
    setCombo(0);
    setRight(0);
    setMissed([]);
    setPicked(null);
    const t = Date.now();
    setNow(t);
    setEndAt(t + ROUND * 1000);
    setPhase("play");
    lock.current = false;
    sfx.engine();
  };

  const end = useCallback(
    (finalScore: number) => {
      setNewBest(finalScore > best);
      setBest(finalScore);
      addXp(Math.round(finalScore / 10));
      sfx.win();
      setPhase("over");
    },
    [best, setBest, addXp],
  );

  const choose = useCallback(
    (i: number) => {
      if (!card || lock.current) return;
      lock.current = true;
      const ok = card.options[i].code === card.sign.code;
      setPicked(i);
      if (ok) {
        const gain = 10 + Math.min(combo, 10) * 2;
        scoreRef.current += gain;
        setScore(scoreRef.current);
        setCombo((c) => c + 1);
        setRight((r) => r + 1);
        setEndAt((e) => e + 1000);
        sfx.correct();
      } else {
        setCombo(0);
        setMissed((m) => (m.some((x) => x.code === card.sign.code) ? m : [...m, card.sign]));
        setEndAt((e) => e - 3000);
        sfx.wrong();
      }
      setTimeout(
        () => {
          setCard((c) => makeCard(c?.sign));
          setN((x) => x + 1);
          setPicked(null);
          lock.current = false;
        },
        ok ? 450 : 1100,
      );
    },
    [card, combo],
  );

  useEffect(() => {
    if (phase !== "play") return;
    const t = setInterval(() => {
      const t2 = Date.now();
      setNow(t2);
      if (t2 >= endAt) {
        clearInterval(t);
        end(scoreRef.current);
      }
    }, 100);
    return () => clearInterval(t);
  }, [phase, endAt, end]);

  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "4") choose(Number(e.key) - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, choose]);

  if (!hydrated) return null;

  if (phase === "intro") {
    return (
      <div className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 px-4 py-10 md:grid-cols-2">
        <div>
          <p className="font-hud text-sm uppercase tracking-[0.2em] text-lane">Mini game</p>
          <h1 className="font-display text-4xl text-white sm:text-5xl">Săn biển báo</h1>
          <p className="mt-3 text-lg text-white/70">
            {ROUND} giây — nhận diện càng nhiều biển báo càng tốt. Đúng được cộng 1 giây, sai bị trừ 3 giây. Combo càng dài, điểm càng cao!
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={start} iconRight={<ArrowRight className="h-5 w-5" />}>
              Bắt đầu săn
            </Button>
            <span className="font-hud text-white/60">
              Kỷ lục: <b className="text-lane">{best}</b>
            </span>
          </div>
          <p className="mt-4 text-sm text-white/45">Phím tắt: 1 – 4 để chọn đáp án.</p>
        </div>
        <div className="relative flex h-72 items-center justify-center">
          {["P.102", "W.225", "R.303", "I.408", "P.127"].map((c, i) => (
            <motion.div
              key={c}
              className="absolute"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1, x: (i - 2) * 70, y: i % 2 ? -40 : 30, rotate: (i - 2) * 6 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
            >
              <div className="rounded-2xl bg-white p-2 shadow-2xl">
                <TrafficSign code={c as SignInfo["code"]} size={96} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "over") {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="rounded-3xl bg-asphalt-850 p-6 text-center ring-1 ring-white/10 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/50">Hết giờ!</p>
          <div className="mt-2 font-hud text-6xl text-white">{score}</div>
          <div className="text-white/55">điểm {newBest && <b className="text-lane">· KỶ LỤC MỚI! 🏆</b>}</div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Tile k="Biển đúng" v={`${right}`} />
            <Tile k="Chính xác" v={`${n > 1 ? Math.round((right / Math.max(1, right + missed.length)) * 100) : 0}%`} />
            <Tile k="Kỷ lục" v={`${Math.max(best, score)}`} />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={start} icon={<RotateCcw className="h-4 w-4" />}>
              Chơi lại
            </Button>
            <ButtonLink href="/bien-bao" variant="secondary">
              Xem thư viện biển báo
            </ButtonLink>
          </div>
        </div>
        {missed.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 font-bold text-white">Biển bạn nhận nhầm — ôn lại nhé</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {missed.map((s) => (
                <div key={s.code} className="flex gap-3 rounded-2xl bg-asphalt-850 p-3 ring-1 ring-white/10">
                  <div className="shrink-0 rounded-xl bg-white p-1.5">
                    <TrafficSign code={s.code} size={64} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-hud text-xs text-lane">{s.code}</div>
                    <div className="font-bold text-white">{s.name}</div>
                    <p className="text-sm text-white/60">{s.meaning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const left = Math.max(0, endAt - now);
  const frac = Math.min(1, left / (ROUND * 1000));

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-30 border-b border-white/5 bg-asphalt-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-3 py-2 sm:px-4">
          <Link href="/bien-bao" className="text-sm font-semibold text-white/60 hover:text-white">
            ✕
          </Link>
          <Timer className="h-4 w-4 text-white/60" />
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className={clsx("h-full rounded-full transition-[width] duration-100 ease-linear", frac > 0.3 ? "bg-green-500" : "bg-red-500")} style={{ width: `${frac * 100}%` }} />
          </div>
          <span className="w-10 text-right font-hud text-white">{Math.ceil(left / 1000)}s</span>
          {combo >= 2 && (
            <span className="flex items-center gap-1 rounded-xl bg-orange-500/20 px-2 py-1 font-hud text-sm text-orange-300">
              <Flame className="h-4 w-4" />x{combo}
            </span>
          )}
          <span className="rounded-xl bg-lane/15 px-3 py-1 font-hud text-lg text-lane">{score}</span>
          <SoundToggle />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-6 px-4 py-6">
        <div className="relative flex h-64 w-full items-end justify-center overflow-hidden rounded-3xl bg-[linear-gradient(180deg,#38bdf8_0%,#bae6fd_55%,#6b7280_55%,#4b5563_100%)] ring-1 ring-white/10 sm:h-72">
          <div className="absolute bottom-0 left-1/2 h-[45%] w-2 -translate-x-1/2 bg-[repeating-linear-gradient(180deg,#facc15_0_16px,transparent_16px_32px)]" />
          <AnimatePresence mode="popLayout">
            {card && (
              <motion.div
                key={n}
                initial={{ scale: 0.2, y: -60, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 1.8, x: 300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className="relative mb-6 flex flex-col items-center"
              >
                <div className="rounded-2xl bg-white/90 p-2 shadow-2xl">
                  <TrafficSign code={card.sign.code} size={132} />
                </div>
                <div className="h-16 w-2 bg-slate-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {card && (
          <div className="grid w-full gap-2.5 sm:grid-cols-2">
            {card.options.map((o, i) => {
              const isAns = o.code === card.sign.code;
              const state = picked === null ? "idle" : isAns ? "right" : picked === i ? "wrong" : "dim";
              return (
                <button
                  key={o.code + n}
                  type="button"
                  onClick={() => choose(i)}
                  className={clsx(
                    "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left font-semibold transition duration-150",
                    state === "idle" && "bg-[linear-gradient(180deg,#252b38,#1d222d)] text-white ring-1 ring-inset ring-white/10 shadow-[0_4px_0_#0b0d12] hover:-translate-y-0.5 hover:ring-lane/50 active:translate-y-1 active:shadow-none",
                    state === "right" && "bg-green-500/20 text-white ring-2 ring-green-500",
                    state === "wrong" && "bg-red-500/20 text-white ring-2 ring-red-500",
                    state === "dim" && "bg-asphalt-850 text-white/40",
                  )}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-hud text-sm">{i + 1}</span>
                  {o.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
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
