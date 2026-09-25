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
}

export interface ExamRecord {
  id: string;
  license: LicenseId;
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
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,
      record: (qid, correct) =>
        set((s) => {
          const prev = s.stats[qid] ?? { c: 0, w: 0, last: 0, t: 0 };
          return {
            stats: {
              ...s.stats,
              [qid]: { c: prev.c + (correct ? 1 : 0), w: prev.w + (correct ? 0 : 1), last: correct ? 1 : 0, t: Date.now() },
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
      setLastLicense: (id) => set({ lastLicense: id }),
      reset: () => set({ ...initial, sound: get().sound }),
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
