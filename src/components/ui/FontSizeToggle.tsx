"use client";

import { useEffect } from "react";
import clsx from "clsx";
import { useHydrated, useProgress } from "@/store/progress";
import { iconButtonClass } from "./Button";

export const FONT_SCALES = [1, 1.15, 1.3];
const LABEL = ["Cỡ chữ chuẩn", "Chữ lớn", "Chữ rất lớn"];

/** Áp dụng cỡ chữ cho toàn trang (mọi kích thước dùng rem sẽ phóng theo). */
export function FontScaleApplier() {
  const scale = useProgress((s) => s.fontScale);
  useEffect(() => {
    document.documentElement.style.fontSize = `${16 * (scale || 1)}px`;
  }, [scale]);
  return null;
}

/** Nút "Aa" chuyển vòng giữa các cỡ chữ. */
export function FontSizeToggle() {
  const hydrated = useHydrated();
  const scale = useProgress((s) => s.fontScale);
  const setScale = useProgress((s) => s.setFontScale);
  const idx = Math.max(0, FONT_SCALES.indexOf(scale));
  if (!hydrated) return <span className="h-10 w-10" />;
  return (
    <button
      type="button"
      onClick={() => setScale(FONT_SCALES[(idx + 1) % FONT_SCALES.length])}
      className={clsx(iconButtonClass(idx > 0), "relative font-display text-sm not-italic")}
      aria-label={`${LABEL[idx]} — bấm để đổi cỡ chữ`}
      title={`${LABEL[idx]} — bấm để đổi cỡ chữ`}
    >
      <span style={{ fontSize: `${12 + idx * 3}px` }}>Aa</span>
      {idx > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-slate-950 px-1 font-hud text-[0.5625rem] text-lane ring-1 ring-lane/50">{idx === 1 ? "L" : "XL"}</span>}
    </button>
  );
}
