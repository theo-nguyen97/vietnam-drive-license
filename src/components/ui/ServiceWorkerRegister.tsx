"use client";

import { useEffect, useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

/** Đăng ký service worker (chỉ khi build production). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  const online = useOnline();
  if (online) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.5rem)] z-[60] flex justify-center">
      <span className="flex items-center gap-1.5 rounded-full bg-slate-900/95 px-3 py-1.5 text-xs font-bold text-amber-300 shadow-lg ring-1 ring-amber-400/40">
        <WifiOff className="h-3.5 w-3.5" /> Đang offline — bạn vẫn học được các trang đã tải
      </span>
    </div>
  );
}

function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

export function useOnline() {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}
