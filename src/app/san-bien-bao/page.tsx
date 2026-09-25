import type { Metadata } from "next";
import { SignHunt } from "@/components/games/SignHunt";

export const metadata: Metadata = { title: "Săn biển báo — mini game" };

export default function SignHuntPage() {
  return (
    <main className="flex flex-1 flex-col">
      <SignHunt />
    </main>
  );
}
