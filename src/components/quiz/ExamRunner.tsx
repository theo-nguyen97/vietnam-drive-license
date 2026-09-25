"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ChevronLeft, Clock, KeyRound, Send, ListChecks, RotateCcw, Grid3x3 } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useSwipe } from "@/lib/useSwipe";
import clsx from "clsx";
import type { LicenseId, Question } from "@/lib/types";
import { examConfig, getLicense } from "@/data/licenses";
import { buildExam, examSets, gradeExam, setCount as totalSets, type ExamResult } from "@/lib/exam";
import { useExamVersion, useHydrated, useProgress } from "@/store/progress";
import { ExamVersionSwitch } from "@/components/ui/ExamVersionSwitch";
import type { ExamVersion } from "@/lib/types";
import { sfx } from "@/lib/sound";
import { SceneStage } from "./SceneStage";
import { QuestionView } from "./QuestionView";
import { QuestionGrid } from "./QuestionGrid";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { FontSizeToggle } from "@/components/ui/FontSizeToggle";
import { Button, ButtonLink, iconButtonClass } from "@/components/ui/Button";

type Stage = "ready" | "countdown" | "running" | "result" | "review";

export function ExamRunner({ license, setNo }: { license: LicenseId; setNo?: number }) {
  const lic = getLicense(license)!;
  const hydrated = useHydrated();
  const chosenVersion = useExamVersion();
  const [runVersion, setRunVersion] = useState<ExamVersion | null>(null);
  const version = runVersion ?? chosenVersion;
  const cfg = examConfig(lic, version);
  const [stage, setStage] = useState<Stage>("ready");
  const [seed, setSeed] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [idx, setIdx] = useState(0);
  const [endAt, setEndAt] = useState(0);
  const [now, setNow] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [count, setCount] = useState(3);
  const [confirm, setConfirm] = useState(false);
  const [filter, setFilter] = useState<"all" | "wrong" | "critical">("all");
  const submitted = useRef(false);
  const [sheet, setSheet] = useState(false);
  const swipe = useSwipe(
    () => {
      if (stage === "running" || stage === "review") window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    },
    () => {
      if (stage === "running" || stage === "review") window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    },
  );

  const record = useProgress((s) => s.record);
  const addExam = useProgress((s) => s.addExam);
  const addXp = useProgress((s) => s.addXp);
  const setLastLicense = useProgress((s) => s.setLastLicense);
  const exams = useProgress((s) => s.exams);

  const start = () => {
    const sd = Date.now() % 1_000_000_007;
    setSeed(sd);
    setRunVersion(chosenVersion);
    setQuestions(setNo ? examSets(license, chosenVersion)[setNo - 1] : buildExam(license, sd, chosenVersion));
    setAnswers({});
    setIdx(0);
    setResult(null);
    setFilter("all");
    submitted.current = false;
    setCount(3);
    setStage("countdown");
    setLastLicense(license);
    sfx.engine();
  };

  // Đếm ngược 3-2-1
  useEffect(() => {
    if (stage !== "countdown") return;
    if (count === 0) {
      const t = setTimeout(() => {
        const n = Date.now();
        setStartedAt(n);
        setNow(n);
        setEndAt(n + cfg.minutes * 60_000);
        setStage("running");
      }, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      sfx.tick();
      setCount((c) => c - 1);
    }, 700);
    return () => clearTimeout(t);
  }, [stage, count, cfg.minutes]);

  const submit = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    const r = gradeExam(license, questions, answers, version);
    setResult(r);
    for (const q of questions) {
      if (answers[q.id] !== undefined) record(q.id, answers[q.id] === q.answer);
    }
    addExam({
      id: `${license}-${setNo ?? "r"}-${seed}`,
      license,
      setNo,
      version,
      at: Date.now(),
      correct: r.correct,
      total: r.total,
      passed: r.passed,
      criticalFail: r.criticalFail,
      duration: Math.round((Date.now() - startedAt) / 1000),
      wrongIds: r.wrongIds,
    });
    addXp((r.passed ? 100 : 20) + r.correct * 2);
    if (r.passed) sfx.win();
    else sfx.lose();
    setConfirm(false);
    setStage("result");
  }, [license, setNo, version, questions, answers, record, addExam, addXp, seed, startedAt]);

  // Đồng hồ
  useEffect(() => {
    if (stage !== "running") return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [stage]);

  const remain = Math.max(0, endAt - now);
  useEffect(() => {
    if (stage === "running" && endAt && remain <= 0) submit();
  }, [remain, stage, endAt, submit]);

  // Cảnh báo khi rời trang giữa chừng
  useEffect(() => {
    if (stage !== "running") return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [stage]);

  // Phím tắt
  useEffect(() => {
    if (stage !== "running" && stage !== "review") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || confirm) return;
      const q = questions[idx];
      if (stage === "running" && q && e.key >= "1" && e.key <= String(q.options.length)) {
        setAnswers((a) => ({ ...a, [q.id]: Number(e.key) - 1 }));
        sfx.click();
      } else if (e.key === "ArrowRight" || e.key === "Enter") setIdx((i) => Math.min(questions.length - 1, i + 1));
      else if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, idx, questions, confirm]);

  const reviewList = useMemo(() => {
    if (!result) return questions.map((_, i) => i);
    return questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => (filter === "wrong" ? answers[q.id] !== q.answer : filter === "critical" ? q.critical : true))
      .map(({ i }) => i);
  }, [questions, result, filter, answers]);

  const backHref = `/hang/${license.toLowerCase()}`;
  const answeredCount = Object.keys(answers).length;

  if (!hydrated) return null;

  /* ---------- Màn chuẩn bị ---------- */
  if (stage === "ready" || stage === "countdown") {
    const history = exams.filter((e) => e.license === license && (e.version ?? "tt12") === version && (setNo ? e.setNo === setNo : true)).slice(0, 5);
    return (
      <div className="relative mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link href={setNo ? `${backHref}/bo-de` : backHref} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-white/60 hover:text-white">
          <ChevronLeft className="h-4 w-4" /> {setNo ? `Bộ đề hạng ${lic.id}` : `Hạng ${lic.id}`}
        </Link>
        <div className="overflow-hidden rounded-3xl bg-asphalt-850 ring-1 ring-white/10">
          <div className="hazard-stripes h-3" />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl font-display text-2xl text-slate-900" style={{ background: lic.color }}>
                {lic.id}
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-white/50">{setNo ? `Bộ đề ${version === "tt108" ? "2027" : "2026"} · ${setNo}/${totalSets(license)}` : "Đề ngẫu nhiên"}</p>
                <h1 className="font-display text-2xl text-white sm:text-3xl">{setNo ? `Đề số ${setNo} — hạng ${lic.id}` : `Thi thử hạng ${lic.id}`}</h1>
              </div>
            </div>
            <ExamVersionSwitch license={license} className="mt-6" />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Rule k="Số câu" v={`${cfg.total}`} />
              <Rule k="Thời gian" v={`${cfg.minutes} phút`} />
              <Rule k="Điểm đạt" v={`≥ ${cfg.pass}/${cfg.total}`} />
              <Rule k="Điểm liệt" v="Sai = trượt" warn />
            </div>
            <ul className="mt-6 space-y-2 text-sm text-white/70">
              <li>
                •{" "}
                {version === "tt108"
                  ? "Cấu trúc mới từ 01/3/2027 (Thông tư 108/2026/TT-BCA): nhiều câu hơn, phải đúng khoảng 90%. Tỉ lệ từng nhóm là dự kiến; vẫn có 01 câu điểm liệt."
                  : `Cấu trúc đề theo Thông tư 12/2025/TT-BCA (bộ ${lic.bank} câu): đủ các nhóm quy định chung, văn hoá, kỹ thuật, biển báo, sa hình và đúng 01 câu điểm liệt.`}
              </li>
              <li>• Có thể đổi đáp án và quay lại câu trước bất cứ lúc nào trước khi nộp bài.</li>
              <li>• Hết giờ hệ thống tự nộp bài. Kết quả và giải thích hiển thị sau khi nộp.</li>
            </ul>
            <Button size="xl" block onClick={start} disabled={stage === "countdown"} className="mt-8" icon={<KeyRound className="h-6 w-6" />}>
              NỔ MÁY — BẮT ĐẦU THI
            </Button>
          </div>
        </div>
        {history.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-white/60">Lần thi gần đây</h2>
            <div className="flex flex-col gap-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5 text-sm ring-1 ring-white/10">
                  <span className="text-white/60">{new Date(h.at).toLocaleString("vi-VN")}</span>
                  <span className="font-hud font-bold text-white">
                    {h.correct}/{h.total}
                  </span>
                  <span className={clsx("rounded-md px-2 py-0.5 text-xs font-bold", h.passed ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300")}>
                    {h.passed ? "ĐẠT" : h.criticalFail ? "TRƯỢT (điểm liệt)" : "TRƯỢT"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence>
          {stage === "countdown" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-asphalt-950/90 backdrop-blur">
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col gap-3 rounded-3xl bg-slate-900 p-4 ring-2 ring-white/10">
                  <Lamp on={count === 3 || count === 2} color="bg-red-500" glow="#ef4444" />
                  <Lamp on={count === 1} color="bg-amber-400" glow="#f59e0b" />
                  <Lamp on={count === 0} color="bg-green-500" glow="#22c55e" />
                </div>
                <motion.div key={count} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-5xl text-white">
                  {count === 0 ? "XUẤT PHÁT!" : count}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ---------- Kết quả ---------- */
  if (stage === "result" && result) {
    const used = Math.round(((endAt - startedAt) - remain) / 1000);
    return (
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative overflow-hidden rounded-3xl bg-asphalt-850 p-6 text-center ring-1 ring-white/10 sm:p-8">
          {result.passed && <Confetti />}
          <p className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Kết quả {setNo ? `đề số ${setNo}` : "thi thử"} · hạng {lic.id}
          </p>
          <motion.div
            initial={{ scale: 2.4, rotate: -18, opacity: 0 }}
            animate={{ scale: 1, rotate: -8, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.2 }}
            className={clsx(
              "mx-auto mt-5 w-fit rounded-2xl border-[6px] px-6 py-2 font-display text-4xl sm:text-5xl",
              result.passed ? "border-green-500 text-green-400" : "border-red-500 text-red-400",
            )}
          >
            {result.passed ? "ĐẠT" : "KHÔNG ĐẠT"}
          </motion.div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Rule k="Số câu đúng" v={`${result.correct}/${result.total}`} />
            <Rule k="Yêu cầu" v={`≥ ${cfg.pass}`} />
            <Rule k="Thời gian" v={`${Math.floor(used / 60)}:${String(used % 60).padStart(2, "0")}`} />
          </div>
          {result.criticalFail && (
            <p className="mt-4 rounded-xl bg-red-500/15 p-3 text-sm font-semibold text-red-200 ring-1 ring-red-400/30">
              ⚠ Bạn đã trả lời sai (hoặc bỏ qua) câu điểm liệt — bài thi bị tính là KHÔNG ĐẠT dù đủ số câu đúng.
            </p>
          )}
          <p className="mt-4 text-sm text-white/60">{result.passed ? "Tuyệt vời! Bạn đã sẵn sàng cho kỳ sát hạch thật. 🎉" : "Đừng nản! Xem lại các câu sai rồi thử một đề khác nhé."}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setFilter(result.wrongIds.length ? "wrong" : "all");
                setIdx(result.wrongIds.length ? questions.findIndex((q) => result.wrongIds.includes(q.id)) : 0);
                setStage("review");
              }}
              icon={<ListChecks className="h-4 w-4" />}
            >
              Xem lại bài làm
            </Button>
            {setNo ? (
              <>
                <Button variant="outline" onClick={start} icon={<RotateCcw className="h-4 w-4" />}>
                  Làm lại đề {setNo}
                </Button>
                {setNo < totalSets(license) && (
                  <ButtonLink href={`${backHref}/bo-de/${setNo + 1}`} iconRight={<ArrowRight className="h-4 w-4" />}>
                    Đề số {setNo + 1}
                  </ButtonLink>
                )}
              </>
            ) : (
              <Button onClick={start} icon={<RotateCcw className="h-4 w-4" />}>
                Thi đề khác
              </Button>
            )}
          </div>
          <Link href={setNo ? `${backHref}/bo-de` : backHref} className="mt-5 inline-block text-sm font-semibold text-white/60 hover:text-white">
            ← {setNo ? `Về bộ đề hạng ${lic.id}` : `Về bản đồ hạng ${lic.id}`}
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ---------- Làm bài / xem lại ---------- */
  const q = questions[idx];
  const review = stage === "review";
  const mm = Math.floor(remain / 60000);
  const ss = Math.floor((remain % 60000) / 1000);
  const low = remain < 60_000;

  const gridPanel = (mobile: boolean) => (
          <div className="rounded-2xl bg-asphalt-850 p-3 ring-1 ring-white/10">
            {review && (
              <div className="mb-3 flex gap-1.5">
                {(
                  [
                    ["all", "Tất cả"],
                    ["wrong", `Sai (${result?.wrongIds.length ?? 0})`],
                    ["critical", "Điểm liệt"],
                  ] as const
                ).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setFilter(k);
                      const first = questions.findIndex((x) => (k === "wrong" ? answers[x.id] !== x.answer : k === "critical" ? x.critical : true));
                      if (first >= 0) setIdx(first);
                    }}
                    className={clsx("rounded-lg px-3 py-1.5 text-xs font-bold transition", filter === k ? "bg-lane text-slate-900 shadow-[0_2px_0_#a87800]" : "bg-white/5 text-white/70 hover:bg-white/10")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <QuestionGrid
              questions={questions}
              current={idx}
              answers={answers}
              reveal={review}
              onJump={(i) => {
                setIdx(i);
                if (mobile) setSheet(false);
              }}
            />
          </div>
  );

  const goPrev = () => {
    if (review) {
      const pos = reviewList.indexOf(idx);
      if (pos > 0) setIdx(reviewList[pos - 1]);
    } else setIdx(Math.max(0, idx - 1));
  };
  const goNext = () => {
    if (review) {
      const pos = reviewList.indexOf(idx);
      if (pos >= 0 && pos < reviewList.length - 1) setIdx(reviewList[pos + 1]);
      else if (pos < 0 && reviewList.length) setIdx(reviewList[0]);
    } else if (idx < questions.length - 1) setIdx(idx + 1);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-30 border-b border-white/5 bg-asphalt-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 sm:px-4">
          <button
            type="button"
            onClick={() => (review ? setStage("result") : setConfirm(true))}
            className={iconButtonClass()}
            aria-label="Quay lại"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-md px-1.5 py-0.5 font-display text-xs text-slate-900" style={{ background: lic.color }}>
                {lic.id}
              </span>
              <span className="truncate font-semibold text-white">{review ? "Xem lại bài thi" : setNo ? `Đề số ${setNo}` : "Đang thi thử"}</span>
            </div>
            <div className="text-xs text-white/50">
              <span className="hidden min-[400px]:inline">Đã trả lời </span>
              <span className="font-hud font-bold text-white">{answeredCount}</span>/{questions.length}
            </div>
          </div>
          {!review && (
            <div
              className={clsx(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-hud text-lg font-bold ring-1",
                low ? "animate-pulse bg-red-500/20 text-red-300 ring-red-400/40" : "bg-black/40 text-green-300 ring-white/10",
              )}
              aria-label="Thời gian còn lại"
            >
              <Clock className="h-4 w-4" />
              {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
            </div>
          )}
          <FontSizeToggle />
          <span className="hidden sm:block">
            <SoundToggle />
          </span>
          <button type="button" onClick={() => setSheet(true)} className={clsx(iconButtonClass(), "lg:hidden")} aria-label="Danh sách câu hỏi">
            <Grid3x3 className="h-4 w-4" />
          </button>
          {!review && (
            <span className="hidden sm:block">
              <Button size="sm" onClick={() => setConfirm(true)} icon={<Send className="h-4 w-4" />}>
                Nộp bài
              </Button>
            </span>
          )}
        </div>
      </div>

      <div {...swipe} className="mx-auto grid w-full max-w-6xl flex-1 gap-4 px-3 py-3 sm:gap-5 sm:px-4 sm:py-4 lg:grid-cols-[1.25fr_1fr] lg:py-6">
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <SceneStage
            q={q}
            number={idx + 1}
            vehicle={lic.vehicle}
            outcome={review ? (answers[q.id] === q.answer ? "correct" : "wrong") : null}
            mode={review ? "review" : "exam"}
          />
          <div className="hidden lg:block">{gridPanel(false)}</div>
        </div>
        <div className="flex flex-col gap-4 pb-24 lg:pb-0">
          <QuestionView
            q={q}
            number={idx + 1}
            total={questions.length}
            selected={answers[q.id]}
            reveal={review}
            onSelect={
              review
                ? undefined
                : (i) => {
                    setAnswers((a) => ({ ...a, [q.id]: i }));
                    sfx.click();
                  }
            }
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-asphalt-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:pb-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-4 lg:justify-end lg:pb-8">
          <Button
            variant="secondary"
            onClick={goPrev}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Trước
          </Button>
          {!review && (
            <Button variant="outline" onClick={() => setConfirm(true)} className="sm:hidden" icon={<Send className="h-4 w-4" />}>
              Nộp
            </Button>
          )}
          <Button
            onClick={() => (!review && idx === questions.length - 1 ? setConfirm(true) : goNext())}
            className="flex-1 sm:flex-none"
            iconRight={<ArrowRight className="h-4 w-4" />}
          >
            {!review && idx === questions.length - 1 ? "Nộp bài" : "Câu tiếp"}
          </Button>
        </div>
      </div>

      <BottomSheet open={sheet} onClose={() => setSheet(false)} title={`Danh sách câu · đã trả lời ${answeredCount}/${questions.length}`}>
        {gridPanel(true)}
      </BottomSheet>

      <AnimatePresence>
        {confirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
            <motion.div initial={{ y: 40 }} animate={{ y: 0 }} className="w-full max-w-sm rounded-3xl bg-asphalt-800 p-6 ring-1 ring-white/10">
              <h3 className="font-display text-xl text-white">Nộp bài?</h3>
              <p className="mt-2 text-sm text-white/70">
                Bạn đã trả lời {answeredCount}/{questions.length} câu.
                {answeredCount < questions.length && <b className="text-amber-300"> Còn {questions.length - answeredCount} câu chưa làm sẽ bị tính là sai.</b>}
              </p>
              <div className="mt-5 flex gap-3">
                <Button variant="secondary" block onClick={() => setConfirm(false)}>
                  Làm tiếp
                </Button>
                <Button block onClick={submit}>
                  Nộp bài
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Rule({ k, v, warn }: { k: string; v: string; warn?: boolean }) {
  return (
    <div className={clsx("rounded-2xl p-3 text-center ring-1", warn ? "bg-red-500/10 ring-red-400/30" : "bg-white/5 ring-white/10")}>
      <div className={clsx("font-hud text-lg font-bold", warn ? "text-red-300" : "text-white")}>{v}</div>
      <div className="text-xs text-white/50">{k}</div>
    </div>
  );
}

function Lamp({ on, color, glow }: { on: boolean; color: string; glow: string }) {
  return <span className={clsx("block h-14 w-14 rounded-full transition", on ? color : "bg-slate-700")} style={on ? { boxShadow: `0 0 30px ${glow}` } : undefined} />;
}

function Confetti() {
  const pieces = Array.from({ length: 36 }, (_, i) => i);
  const colors = ["#22c55e", "#facc15", "#3b82f6", "#ef4444", "#a855f7"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => (
        <motion.span
          key={i}
          className="absolute top-0 h-2.5 w-1.5 rounded-sm"
          style={{ left: `${(i * 37) % 100}%`, background: colors[i % colors.length] }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: 520, rotate: 360 * (i % 2 ? 1 : -1), opacity: 0 }}
          transition={{ duration: 2.2 + (i % 5) * 0.3, delay: (i % 7) * 0.08, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
