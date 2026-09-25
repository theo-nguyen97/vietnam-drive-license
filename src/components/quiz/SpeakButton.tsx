"use client";

import { useEffect, useState } from "react";
import { Volume2, Square } from "lucide-react";
import clsx from "clsx";

/** Đọc to nội dung bằng giọng tiếng Việt của trình duyệt (Web Speech API). */
export function SpeakButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [text]);

  const toggle = () => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "vi-VN";
    u.rate = 1;
    const vi = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("vi"));
    if (vi) u.voice = vi;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={clsx("rounded-lg p-1.5 transition", speaking ? "text-lane" : "text-white/40 hover:text-white/80")}
      aria-label={speaking ? "Dừng đọc" : "Đọc câu hỏi"}
      title={speaking ? "Dừng đọc" : "Đọc câu hỏi (giọng tiếng Việt)"}
    >
      {speaking ? <Square className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  );
}
