"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import type { ExamVersion, LicenseId } from "@/lib/types";
import { TT108_DATE } from "@/data/licenses";

export interface QStat {
  /** số lần đúng */
  c: number;
  /** số lần sai */
  w: number;
  /** kết quả lần gần nhất: 1 đúng, 0 sai */
  last: 0 | 1;
  /** thời điểm trả lời gần nhất */
  t: number;
  /** hộp Leitner (0–5) cho ôn tập ngắt quãng */
  box?: number;
  /** thời điểm cần ôn lại (ms) */
  due?: number;
}

/** Khoảng cách ôn lại theo hộp Leitner: 10 phút, 1, 3, 7, 16, 35 ngày. */
const DAY = 86_400_000;
export const REVIEW_INTERVALS = [10 * 60_000, DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];

export interface ExamRecord {
  id: string;
  license: LicenseId;
  /** Số đề trong bộ đề (không có nếu là đề ngẫu nhiên). */
  setNo?: number;
  /** Cấu trúc đề (mặc định tt12). */
  version?: ExamVersion;
  at: number;
  correct: number;
  total: number;
  passed: boolean;
  criticalFail: boolean;
  duration: number;
  wrongIds: number[];
}

interface ProgressState {
  stats: Record<number, QStat>;
  exams: ExamRecord[];
  xp: number;
  streak: { days: number; last: string };
  bestCombo: number;
  bookmarks: number[];
  sound: boolean;
  lastLicense: LicenseId | null;
  /** tên in trên bằng lái ảo */
  driverName: string;
  /** điểm cao nhất thử thách 12 điểm theo hạng */
  arcadeBest: Partial<Record<LicenseId, number>>;
  /** điểm cao nhất mini-game săn biển báo */
  signBest: number;
  /** Cấu trúc đề người dùng chọn (null = tự động theo ngày). */
  examVersion: ExamVersion | null;
  /** Cỡ chữ: 1 (chuẩn), 1.15 (lớn), 1.3 (rất lớn) */
  fontScale: number;
  /** Các bước đã hoàn thành trong lộ trình lấy bằng */
  journey: Record<string, boolean>;
  /** Đã trả lời màn chào (chọn hạng, thời điểm thi) */
  onboarded: boolean;
  /** Dự định thời điểm thi: trước / từ 01/3/2027 / chưa biết */
  examTiming: "before" | "after" | "unknown" | null;
  completeOnboarding: (license: LicenseId, timing: "before" | "after" | "unknown") => void;
  setExamVersion: (v: ExamVersion) => void;
  setFontScale: (n: number) => void;
  toggleJourney: (key: string) => void;
  setDriverName: (n: string) => void;
  setArcadeBest: (id: LicenseId, score: number) => void;
  setSignBest: (score: number) => void;
  record: (qid: number, correct: boolean) => void;
  addXp: (n: number) => void;
  setBestCombo: (n: number) => void;
  addExam: (r: ExamRecord) => void;
  toggleBookmark: (qid: number) => void;
  setSound: (v: boolean) => void;
  setLastLicense: (id: LicenseId) => void;
  reset: () => void;
  importData: (json: string) => boolean;
}

function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nextStreak(s: { days: number; last: string }) {
  const today = dayKey();
  if (s.last === today) return s;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return { days: s.last === dayKey(y) ? s.days + 1 : 1, last: today };
}

const initial = {
  stats: {} as Record<number, QStat>,
  exams: [] as ExamRecord[],
  xp: 0,
  streak: { days: 0, last: "" },
  bestCombo: 0,
  bookmarks: [] as number[],
  sound: true,
  lastLicense: null as LicenseId | null,
  driverName: "",
  arcadeBest: {} as Partial<Record<LicenseId, number>>,
  signBest: 0,
  examVersion: null as ExamVersion | null,
  fontScale: 1,
  journey: {} as Record<string, boolean>,
  onboarded: false,
  examTiming: null as "before" | "after" | "unknown" | null,
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,
      record: (qid, correct) =>
        set((s) => {
          const prev = s.stats[qid] ?? { c: 0, w: 0, last: 0, t: 0 };
          const now = Date.now();
          const box = correct ? Math.min(REVIEW_INTERVALS.length - 1, (prev.box ?? 0) + (prev.t ? 1 : 2)) : 0;
          return {
            stats: {
              ...s.stats,
              [qid]: {
                c: prev.c + (correct ? 1 : 0),
                w: prev.w + (correct ? 0 : 1),
                last: correct ? 1 : 0,
                t: now,
                box,
                due: now + REVIEW_INTERVALS[box],
              },
            },
            streak: nextStreak(s.streak),
          };
        }),
      addXp: (n) => set((s) => ({ xp: Math.max(0, s.xp + n) })),
      setBestCombo: (n) => set((s) => ({ bestCombo: Math.max(s.bestCombo, n) })),
      addExam: (r) => set((s) => ({ exams: [r, ...s.exams].slice(0, 50), streak: nextStreak(s.streak) })),
      toggleBookmark: (qid) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(qid) ? s.bookmarks.filter((x) => x !== qid) : [...s.bookmarks, qid],
        })),
      setSound: (v) => set({ sound: v }),
      setDriverName: (n) => set({ driverName: n.slice(0, 32) }),
      setArcadeBest: (id, score) => set((s) => ({ arcadeBest: { ...s.arcadeBest, [id]: Math.max(s.arcadeBest[id] ?? 0, score) } })),
      setSignBest: (score) => set((s) => ({ signBest: Math.max(s.signBest, score) })),
      setExamVersion: (v) => set({ examVersion: v }),
      setFontScale: (n) => set({ fontScale: n }),
      completeOnboarding: (license, timing) =>
        set({
          lastLicense: license,
          examTiming: timing,
          examVersion: timing === "after" ? "tt108" : timing === "before" ? "tt12" : null,
          onboarded: true,
        }),
      toggleJourney: (key) => set((s) => ({ journey: { ...s.journey, [key]: !s.journey[key] } })),
      setLastLicense: (id) => set({ lastLicense: id }),
      reset: () =>
        set({
          ...initial,
          sound: get().sound,
          driverName: get().driverName,
          fontScale: get().fontScale,
          examVersion: get().examVersion,
          onboarded: get().onboarded,
          lastLicense: get().lastLicense,
          examTiming: get().examTiming,
        }),
      importData: (json) => {
        try {
          const data = JSON.parse(json);
          const parsed = sanitizeImport(data?.state ?? data);
          if (!parsed) return false;
          set(parsed);
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "lai-lua-progress",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Giữ dữ liệu cũ khi nâng version (mặc định zustand sẽ bỏ toàn bộ state nếu thiếu migrate).
      migrate: (persisted) => ({ ...initial, ...(persisted as Partial<ProgressState>) }),
      partialize: (s) => ({
        stats: s.stats,
        exams: s.exams,
        xp: s.xp,
        streak: s.streak,
        bestCombo: s.bestCombo,
        bookmarks: s.bookmarks,
        sound: s.sound,
        lastLicense: s.lastLicense,
        driverName: s.driverName,
        arcadeBest: s.arcadeBest,
        signBest: s.signBest,
        examVersion: s.examVersion,
        fontScale: s.fontScale,
        journey: s.journey,
        onboarded: s.onboarded,
        examTiming: s.examTiming,
      }),
    },
  ),
);

const num = (v: unknown, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Kiểm tra & làm sạch dữ liệu nhập từ tệp JSON — dữ liệu sai kiểu sẽ làm app lỗi ở mọi trang. */
function sanitizeImport(st: unknown): Pick<ProgressState, "stats" | "exams" | "xp" | "streak" | "bestCombo" | "bookmarks"> | null {
  if (!isObj(st) || !isObj(st.stats)) return null;
  const stats: Record<number, QStat> = {};
  for (const [k, v] of Object.entries(st.stats)) {
    const id = Number(k);
    if (!Number.isInteger(id) || !isObj(v)) continue;
    const c = num(v.c);
    const w = num(v.w);
    const box = Math.min(REVIEW_INTERVALS.length - 1, Math.max(0, Math.floor(num(v.box))));
    stats[id] = { c, w, last: num(v.last) ? 1 : 0, t: num(v.t), box, due: v.due === undefined ? undefined : num(v.due) };
  }
  const exams: ExamRecord[] = (Array.isArray(st.exams) ? st.exams : [])
    .filter((e): e is Record<string, unknown> => isObj(e) && typeof e.license === "string")
    .slice(0, 50)
    .map((e) => ({
      id: String(e.id ?? `${e.license}-${num(e.at)}`),
      license: e.license as LicenseId,
      setNo: e.setNo === undefined ? undefined : num(e.setNo),
      version: e.version === "tt108" ? "tt108" : e.version === "tt12" ? "tt12" : undefined,
      at: num(e.at),
      correct: num(e.correct),
      total: num(e.total),
      passed: !!e.passed,
      criticalFail: !!e.criticalFail,
      duration: num(e.duration),
      wrongIds: Array.isArray(e.wrongIds) ? e.wrongIds.map(Number).filter(Number.isInteger) : [],
    }));
  const streak = isObj(st.streak) ? { days: Math.max(0, num(st.streak.days)), last: typeof st.streak.last === "string" ? st.streak.last : "" } : { days: 0, last: "" };
  return {
    stats,
    exams,
    xp: Math.max(0, num(st.xp)),
    streak,
    bestCombo: Math.max(0, num(st.bestCombo)),
    bookmarks: Array.isArray(st.bookmarks) ? [...new Set(st.bookmarks.map(Number).filter(Number.isInteger))] : [],
  };
}

const noop = () => () => {};

/** true sau khi đã chạy ở client (tránh lệch dữ liệu khi hydrate). */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** Ngày hiện tại có còn giữ chuỗi học hay không. */
export function activeStreak(s: { days: number; last: string }) {
  const today = dayKey();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return s.last === today || s.last === dayKey(y) ? s.days : 0;
}

/** Cấu trúc đề mặc định theo ngày hiện tại. */
export function defaultExamVersion(now = new Date()): ExamVersion {
  return now >= TT108_DATE ? "tt108" : "tt12";
}

/** Cấu trúc đề đang dùng (người dùng chọn hoặc tự động theo ngày — dùng useNow để server/client khớp khi hydrate). */
export function useExamVersion(): ExamVersion {
  const hydrated = useHydrated();
  const v = useProgress((s) => s.examVersion);
  const now = useNow();
  return (hydrated && v) || defaultExamVersion(new Date(now));
}

let nowMinute = 0;
function readNowMinute() {
  const m = Math.floor(Date.now() / 60_000);
  if (m !== nowMinute) nowMinute = m;
  return nowMinute;
}

/** Thời điểm hiện tại (ms, làm tròn theo phút) — an toàn khi hydrate. */
export function useNow() {
  return useSyncExternalStore(noop, readNowMinute, () => 0) * 60_000;
}
