"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect } from "react";
import { useHydrated, useProgress } from "@/store/progress";
import { setSoundEnabled } from "@/lib/sound";
import { iconButtonClass } from "./Button";

export function SoundToggle() {
  const hydrated = useHydrated();
  const sound = useProgress((s) => s.sound);
  const setSound = useProgress((s) => s.setSound);
  useEffect(() => {
    setSoundEnabled(sound);
  }, [sound]);
  if (!hydrated) return <span className="h-10 w-10" />;
  return (
    <button
      type="button"
      onClick={() => setSound(!sound)}
      className={iconButtonClass()}
      aria-label={sound ? "Tắt âm thanh" : "Bật âm thanh"}
      title={sound ? "Tắt âm thanh" : "Bật âm thanh"}
    >
      {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}
