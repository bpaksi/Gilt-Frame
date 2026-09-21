import { colorBases } from "./tokens";
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

// 8 back-and-forth movement variants defined in globals.css (ap-0 … ap-7)
const ANIM_COUNT = 8;

export default function AmbientParticles({
  count = 50,
  opacity = 0.5,
  active = true,
}: AmbientParticlesProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        // Size: 2–10px — small motes through larger wisps
        const size = 2 + scatter(i, 7, 9, 0);
        // Glow bloom scales with size
        const bloom = Math.ceil(size * 2);
        // Larger particles are rarer and softer; smaller are brighter relative to their size
        const coreAlpha = 0.7 + scatter(i, 29, 30, 0) / 100; // 0.70–1.00
        // Occasional goldBright flash
        const colorBase = i % 7 === 0 ? colorBases.goldBright : colorBases.gold;
        // Duration: 5–14s
        const duration = 5 + scatter(i, 13, 10, 0) * 0.9;
        // Negative delay: all particles appear already mid-drift at first render
        const delay = -(scatter(i, 19, 110, 0) * 0.1);
        // Wide spread across container
        const leftPos = scatter(i, 17, 86, 3);
        const topPos = scatter(i, 23, 80, 5);
        const animName = `ap-${i % ANIM_COUNT}`;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: "50%",
              background: `rgba(${colorBase}, ${coreAlpha})`,
              // Three glow layers: tight bright core → mid halo → soft outer bloom
              boxShadow: [
                `0 0 ${bloom}px rgba(${colorBase}, 0.9)`,
                `0 0 ${bloom * 2}px rgba(${colorBase}, 0.45)`,
                `0 0 ${bloom * 4}px rgba(${colorBase}, 0.15)`,
              ].join(", "),
              left: `${leftPos}%`,
              top: `${topPos}%`,
              opacity: active ? opacity : 0,
              transition: "opacity 1s ease",
              animationName: active ? animName : "none",
              animationDuration: `${duration}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </>
  );
}

export const showcase: ShowcaseDefinition<AmbientParticlesProps> = {
  category: "ui",
  label: "Ambient Particles",
  description: "Glowing gold orbs with varied bloom halos drifting in 8 directions",
  defaults: { count: 50, opacity: 0.5, active: true },
};
