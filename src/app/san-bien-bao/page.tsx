import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { SignHunt } from "@/components/games/SignHunt";

export const metadata: Metadata = pageMeta({
  title: "Săn biển báo — mini game",
  description: "Mini game 60 giây nhận diện biển báo giao thông: trả lời càng nhanh, combo càng dài, điểm càng cao.",
  path: "/san-bien-bao/",
  noindex: true,
});

export default function SignHuntPage() {
  return (
    <main className="flex flex-1 flex-col">
      <SignHunt />
    </main>
  );
}
