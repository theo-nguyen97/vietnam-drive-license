"use client";

import { ArrowRight } from "lucide-react";
import { useHydrated, useProgress } from "@/store/progress";
import { ButtonLink } from "@/components/ui/Button";

export function ContinueButton() {
  const hydrated = useHydrated();
  const last = useProgress((s) => s.lastLicense);
  const resume = hydrated && last;
  return (
    <ButtonLink href={resume ? `/hang/${last.toLowerCase()}` : "#hang-bang"} size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
      {resume ? `Tiếp tục hạng ${last}` : "Chọn xe & bắt đầu"}
    </ButtonLink>
  );
}
