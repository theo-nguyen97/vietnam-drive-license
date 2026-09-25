export function Gauge({ value, color, label }: { value: number; color: string; label: string }) {
  const v = Math.max(0, Math.min(1, value));
  const R = 70;
  const start = Math.PI * 0.8;
  const end = Math.PI * 2.2;
  const a = start + (end - start) * v;
  const pt = (ang: number, r = R) => [100 + r * Math.cos(ang), 100 + r * Math.sin(ang)];
  const [sx, sy] = pt(start);
  const [ex, ey] = pt(end);
  const [vx, vy] = pt(a);
  const large = (end - start) * v > Math.PI ? 1 : 0;
  const ticks = Array.from({ length: 11 }, (_, i) => start + ((end - start) * i) / 10);
  return (
    <svg viewBox="0 0 200 172" className="w-full max-w-[220px]" role="img" aria-label={`${label}: ${Math.round(v * 100)}%`}>
      <path d={`M${sx} ${sy} A${R} ${R} 0 1 1 ${ex} ${ey}`} fill="none" stroke="#ffffff14" strokeWidth={14} strokeLinecap="round" />
      {v > 0.001 && <path d={`M${sx} ${sy} A${R} ${R} 0 ${large} 1 ${vx} ${vy}`} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" />}
      {ticks.map((t, i) => {
        const [x1, y1] = pt(t, 52);
        const [x2, y2] = pt(t, i % 5 === 0 ? 42 : 47);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff55" strokeWidth={i % 5 === 0 ? 2.5 : 1.5} />;
      })}
      <line x1={100} y1={100} x2={pt(a, 58)[0]} y2={pt(a, 58)[1]} stroke="#f8fafc" strokeWidth={4} strokeLinecap="round" />
      <circle cx={100} cy={100} r={8} fill="#f8fafc" />
      <text x={100} y={146} textAnchor="middle" fontSize={26} fontWeight={800} fill="#fff" fontFamily="var(--font-hud)">{Math.round(v * 100)}%</text>
      <text x={100} y={165} textAnchor="middle" fontSize={11} fill="#ffffff88" fontFamily="var(--font-sans)">{label}</text>
    </svg>
  );
}
