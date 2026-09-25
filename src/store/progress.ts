"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import type { LicenseId } from "@/lib/types";

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
      setLastLicense: (id) => set({ lastLicense: id }),
      reset: () => set({ ...initial, sound: get().sound, driverName: get().driverName }),
      importData: (json) => {
        try {
          const data = JSON.parse(json);
          const st = data?.state ?? data;
          if (typeof st !== "object" || !st.stats) return false;
          set({
            stats: st.stats ?? {},
            exams: st.exams ?? [],
            xp: Number(st.xp) || 0,
            streak: st.streak ?? { days: 0, last: "" },
            bestCombo: Number(st.bestCombo) || 0,
            bookmarks: st.bookmarks ?? [],
          });
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
      }),
    },
  ),
);

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
