import { colors } from "./tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface AmbientParticlesProps {
  count?: number;
  opacity?: number;
  active?: boolean;
}

// Deterministic scatter — breaks grid regularity without Math.random()
// Uses prime-based modular arithmetic for organic-feeling placement
function scatter(index: number, prime: number, range: number, offset: number): number {
  return offset + ((index * prime + 7) % range);
}

export default function AmbientParticles({
  count = 6,
  opacity = 0.2,
  active = true,
}: AmbientParticlesProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "2px",
            height: "2px",
            borderRadius: "50%",
            background: colors.gold,
            opacity: active ? opacity : 0,
            left: `${scatter(i, 17, 70, 8)}%`,
            top: `${scatter(i, 23, 60, 12)}%`,
            animationName: active ? "drift" : "none",
            animationDuration: `${5 + ((i * 13) % 5) * 1.2}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: `${i * 0.8}s`,
            transition: "opacity 1s ease",
          }}
        />
      ))}
    </>
  );
}

export const showcase: ShowcaseDefinition<AmbientParticlesProps> = {
  category: "ui",
  label: "Ambient Particles",
  description: "Floating gold dust particles with drift animation",
  defaults: { count: 6, opacity: 0.3, active: true },
};
