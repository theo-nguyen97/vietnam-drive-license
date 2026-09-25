import type { PlayerVehicle } from "@/lib/types";
import { RearVehicle } from "@/components/scene/sprites";

/** Minh hoạ xe (nhìn từ phía sau) cho thẻ hạng bằng. */
export function VehicleIcon({ kind, className }: { kind: PlayerVehicle; className?: string }) {
  return (
    <svg viewBox="-130 -205 260 215" className={className} aria-hidden>
      <RearVehicle kind={kind} />
    </svg>
  );
}
