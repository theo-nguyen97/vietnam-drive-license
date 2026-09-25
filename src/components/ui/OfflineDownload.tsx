"use client";

import { useState } from "react";
import { CloudDownload, CheckCircle2 } from "lucide-react";
import type { LicenseId } from "@/lib/types";
import { downloadForOffline, offlineSupported } from "@/lib/offline";
import { useHydrated } from "@/store/progress";
import { Button } from "./Button";

const KEY = "lai-lua-offline";

function readSaved(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

/** Nút tải trọn gói một hạng để học khi không có mạng. */
export function OfflineDownload({ license }: { license: LicenseId }) {
  const hydrated = useHydrated();
  const [progress, setProgress] = useState<number | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  if (!hydrated) return null;
  const supported = offlineSupported();
  const saved = savedAt ?? readSaved()[license];

  const run = async () => {
    setProgress(0);
    try {
      await downloadForOffline(license, setProgress);
      const all = { ...readSaved(), [license]: Date.now() };
      localStorage.setItem(KEY, JSON.stringify(all));
      setSavedAt(all[license]);
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-asphalt-850 p-4 ring-1 ring-white/10 sm:flex-row sm:items-center sm:p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30">
        {saved ? <CheckCircle2 className="h-5 w-5" /> : <CloudDownload className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-white">Học không cần mạng</div>
        <div className="text-sm text-white/55">
          {!supported
            ? "Trình duyệt này chưa hỗ trợ lưu để học offline."
            : saved
              ? `Đã tải hạng ${license} lúc ${new Date(saved).toLocaleString("vi-VN")}. Mở web khi mất mạng vẫn học được.`
              : `Tải trọn bộ câu hỏi, bộ đề và các chế độ luyện của hạng ${license} (vài MB).`}
        </div>
        {progress !== null && (
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-sky-400 transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        )}
      </div>
      {supported && (
        <Button variant={saved ? "secondary" : "primary"} size="sm" onClick={run} disabled={progress !== null} icon={<CloudDownload className="h-4 w-4" />}>
          {progress !== null ? `Đang tải ${Math.round(progress * 100)}%` : saved ? "Cập nhật" : "Tải về"}
        </Button>
      )}
    </div>
  );
}
