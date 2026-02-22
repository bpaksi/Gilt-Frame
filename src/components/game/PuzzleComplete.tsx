"use client";

import AmbientParticles from "@/components/ui/AmbientParticles";
import { colors } from "@/components/ui/tokens";
import UnlockAnimation from "./UnlockAnimation";
import type { ShowcaseDefinition } from "@/components/showcase";

interface PuzzleCompleteProps {
  onComplete: () => void;
}

export default function PuzzleComplete({ onComplete }: PuzzleCompleteProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: colors.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 40,
      }}
    >
      <AmbientParticles />
      <UnlockAnimation onComplete={onComplete} />
    </div>
  );
}

export const showcase: ShowcaseDefinition<PuzzleCompleteProps> = {
  category: "game",
  label: "Puzzle Complete",
  description: "Full-screen ceremony overlay triggered on step completion",
  uses: ["AmbientParticles", "UnlockAnimation"],
  defaults: {},
  callbacks: { onComplete: "done" },
};
