"use client";

import AmbientParticles from "@/components/ui/AmbientParticles";
import { colors } from "@/components/ui/tokens";
import CeremonyAnimation from "./CeremonyAnimation";
import type { ShowcaseDefinition } from "@/components/showcase";

interface PuzzleSolveProps {
  onAdvance: () => void;
}

export default function PuzzleSolve({ onAdvance }: PuzzleSolveProps) {
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
      <CeremonyAnimation onUnlock={onAdvance} />
    </div>
  );
}

export const showcase: ShowcaseDefinition<PuzzleSolveProps> = {
  category: "game",
  label: "Puzzle Solve",
  description: "Full-screen ceremony overlay triggered on step completion",
  uses: ["AmbientParticles", "CeremonyAnimation"],
  defaults: { onAdvance: () => {} },
};
