export const RANKS = [
  { xp: 0, name: "Học viên", icon: "🔰" },
  { xp: 150, name: "Tài xế tập sự", icon: "🚲" },
  { xp: 400, name: "Tài xế", icon: "🛵" },
  { xp: 900, name: "Tay lái cứng", icon: "🚗" },
  { xp: 1800, name: "Tay lái lụa", icon: "🏎️" },
  { xp: 3500, name: "Huyền thoại đường phố", icon: "🏆" },
];

export function rankOf(xp: number) {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].xp) idx = i;
  const cur = RANKS[idx];
  const next = RANKS[idx + 1];
  const progress = next ? (xp - cur.xp) / (next.xp - cur.xp) : 1;
  return { ...cur, level: idx + 1, next, progress };
}
