import type { SignCode } from "@/lib/types";
import { getSign } from "@/data/signs";
import { SignGraphic } from "./SignGraphic";

export function TrafficSign({
  code,
  size = 96,
  value,
  className,
  title,
}: {
  code: SignCode;
  size?: number;
  value?: string | number;
  className?: string;
  title?: boolean;
}) {
  const info = getSign(code);
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`${code} – ${info?.name ?? ""}`}
    >
      {title && <title>{`${code} – ${info?.name ?? ""}`}</title>}
      <SignGraphic code={code} value={value} />
    </svg>
  );
}
