"use client";

import { useRef } from "react";

/**
 * Vuốt ngang để chuyển câu trên điện thoại. Trả về các handler gắn vào phần tử bao ngoài.
 * Bỏ qua cử chỉ chủ yếu theo chiều dọc (cuộn trang).
 */
export function useSwipe(onLeft: () => void, onRight: () => void, threshold = 70) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  return {
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - s.x;
      const dy = t.clientY - s.y;
      if (Date.now() - s.t > 700 || Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.6) return;
      if (dx < 0) onLeft();
      else onRight();
    },
  };
}
