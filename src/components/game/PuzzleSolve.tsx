"use client";

import AmbientParticles from "@/components/ui/AmbientParticles";
import CeremonyAnimation from "./CeremonyAnimation";

interface PuzzleSolveProps {
  onAdvance: () => void;
}

export default function PuzzleSolve({ onAdvance }: PuzzleSolveProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0a0a",
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
