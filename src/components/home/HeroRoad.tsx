import { TopVehicle } from "@/components/scene/sprites";

/** Dải đường động ở phần đầu trang chủ. */
export function HeroRoad() {
  const lanes = [
    { kind: "car" as const, color: "#ef4444", dur: 9, delay: 0, top: "22%", dir: 1 },
    { kind: "truck" as const, color: "#e2e8f0", dur: 13, delay: 3, top: "22%", dir: 1 },
    { kind: "moto" as const, color: "#111827", dur: 7, delay: 5, top: "30%", dir: 1 },
    { kind: "bus" as const, color: "#facc15", dur: 12, delay: 1, top: "62%", dir: -1 },
    { kind: "ambulance" as const, color: "", dur: 8, delay: 6, top: "70%", dir: -1 },
    { kind: "car" as const, color: "#3b82f6", dur: 10, delay: 4, top: "62%", dir: -1 },
  ];
  return (
    <div className="relative h-28 overflow-hidden rounded-3xl bg-asphalt-700 ring-1 ring-white/10 sm:h-32">
      <div className="absolute inset-x-0 top-0 h-3 bg-stone-300/80" />
      <div className="absolute inset-x-0 bottom-0 h-3 bg-stone-300/80" />
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <div className="lane-divider" />
      </div>
      {lanes.map((l, i) => (
        <div
          key={i}
          className="absolute left-0"
          style={{
            top: l.top,
            animation: `${l.dir > 0 ? "drive-across" : "drive-back"} ${l.dur}s linear ${-l.delay}s infinite`,
          }}
        >
          <svg width={90} height={40} viewBox="-45 -20 90 40">
            <g transform="scale(1.3)">
              <TopVehicle kind={l.kind} color={l.color || undefined} />
            </g>
          </svg>
        </div>
      ))}
    </div>
  );
}
