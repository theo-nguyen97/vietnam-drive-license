"use client";

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.12, slideTo?: number) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export const sfx = {
  correct() {
    if (!enabled) return;
    tone(660, 0, 0.12, "triangle", 0.14);
    tone(990, 0.1, 0.22, "triangle", 0.14);
  },
  wrong() {
    if (!enabled) return;
    // tiếng còi "bíp bíp"
    tone(330, 0, 0.16, "square", 0.06);
    tone(392, 0, 0.16, "square", 0.05);
    tone(330, 0.2, 0.22, "square", 0.06);
    tone(392, 0.2, 0.22, "square", 0.05);
  },
  engine() {
    if (!enabled) return;
    tone(55, 0, 0.9, "sawtooth", 0.05, 140);
    tone(110, 0.05, 0.8, "square", 0.02, 220);
  },
  click() {
    if (!enabled) return;
    tone(880, 0, 0.05, "sine", 0.05);
  },
  win() {
    if (!enabled) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, "triangle", 0.12));
  },
  lose() {
    if (!enabled) return;
    [392, 330, 262].forEach((f, i) => tone(f, i * 0.18, 0.3, "sawtooth", 0.06));
  },
  tick() {
    if (!enabled) return;
    tone(1200, 0, 0.03, "square", 0.03);
  },
};
