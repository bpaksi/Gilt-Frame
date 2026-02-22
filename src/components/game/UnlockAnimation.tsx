"use client";

import { useEffect, useRef, useState } from "react";
import { colors } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";
import TapToContinue from "./TapToContinue";
import {
  easeInOut, easeOut, easeIn, clamp01, lerp, prog, pointOnBorder,
  TIMELINE, FRAME_X, FRAME_Y, FRAME_W, FRAME_H,
  CENTER_X, CENTER_Y, TRAIL_COUNT, TRAIL_LAG, TRAIL_RADII, TRAIL_OPACITIES,
  SAND_DOTS,
} from "./puzzleSolveAnimation";

interface UnlockAnimationProps {
  onComplete: () => void;
  unlockText?: string;
  supernova?: boolean;
}

export default function UnlockAnimation({
  onComplete,
  unlockText = "Press to Unlock",
  supernova = false,
}: UnlockAnimationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const orbRef = useRef<SVGCircleElement>(null);
  const borderRef = useRef<SVGRectElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(SVGCircleElement | null)[]>([]);
  const curve1Ref = useRef<SVGPathElement>(null);
  const curve2Ref = useRef<SVGPathElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const [showTapPhase, setShowTapPhase] = useState(false);

  useEffect(() => {
    let animStart: number | null = null;
    let rafId: number;
    let flashFired = false;
    const PRELUDE = supernova ? 6000 : 0;

    // Core ceremony gather particles (small radius, used after prelude)
    const particles: { sx: number; sy: number; delay: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      particles.push({
        sx: CENTER_X + Math.cos(angle) * 200,
        sy: CENTER_Y + Math.sin(angle) * 200,
        delay: Math.random() * 800,
      });
    }

    // Supernova convergence particles — screen-edge ellipse, only used during prelude
    const novaParticles: { sx: number; sy: number; delay: number }[] = [];
    if (supernova) {
      for (let i = 0; i < 40; i++) {
        const angle = (i / 40) * Math.PI * 2;
        novaParticles.push({
          sx: CENTER_X + Math.cos(angle) * 400,
          sy: CENTER_Y + Math.sin(angle) * 500,
          delay: Math.random() * 300,
        });
      }
    }

    function animate(timestamp: number) {
      if (!animStart) animStart = timestamp;
      const elapsed = timestamp - animStart;
      const t = elapsed - PRELUDE; // core ceremony time

      const orb = orbRef.current;
      const border = borderRef.current;
      const flash = flashRef.current;
      const c1 = curve1Ref.current;
      const c2 = curve2Ref.current;
      if (!orb || !border) { rafId = requestAnimationFrame(animate); return; }

      const svg = svgRef.current;
      if (!svg) { rafId = requestAnimationFrame(animate); return; }

      svg.querySelectorAll(".nova-p,.gather-particle").forEach((el) => el.remove());

      // ═══ SUPERNOVA PRELUDE ═══════════════════════════════════════════════
      // Timeline (elapsed ms):
      //   0–800    CHARGE   — big orb builds on black screen
      //   800–1100 COLLAPSE — orb rapidly fades → black
      //  1100–1600 PAUSE    — hold on black
      //  1600–1800 RAMP     — flash ramps to full white
      //  1800–3800 WHITE    — full white holds (2s)
      //  3800–5300 FADE     — white fades (1.5s); nova particles × (1-flashAlpha)
      //  5300ms    FOCUS    — center dot glows briefly
      //  5500–6000 SETTLE   — black before core ceremony
      if (supernova && elapsed < PRELUDE) {
        orb.setAttribute("cx", String(CENTER_X));
        orb.setAttribute("cy", String(CENTER_Y));

        // ── Flash — JS-driven (200ms ramp / 2s hold / 1.5s fade) ──────────
        // flashAlpha is the authoritative brightness value. Nova particle opacities
        // are multiplied by (1 - flashAlpha) — mathematically zero during the white
        // phase regardless of CSS stacking context or z-index.
        let flashAlpha = 0;
        if (elapsed >= 1600) {
          const ft = elapsed - 1600;
          if (ft < 200) flashAlpha = ft / 200;
          else if (ft < 2200) flashAlpha = 1;
          else flashAlpha = Math.max(0, 1 - (ft - 2200) / 1500);
        }
        if (flash) flash.style.opacity = String(flashAlpha);
        if (elapsed >= 1600) flashFired = true; // prevent core screenFlash from re-firing

        // ── Orb (mutually exclusive phases) ───────────────────────────────
        if (elapsed < 800) {
          // CHARGE: orb grows large on black screen
          const p = easeOut(elapsed / 800);
          orb.setAttribute("r", String(2 + p * 98));
          orb.style.opacity = String(p);
        } else if (elapsed < 1100) {
          // COLLAPSE: orb rapidly shrinks and fades → black
          const fadeT = (elapsed - 800) / 300;
          orb.setAttribute("r", String(lerp(100, 5, easeIn(fadeT))));
          orb.style.opacity = String(1 - easeIn(fadeT));
        } else if (elapsed < 5300) {
          // HIDDEN: black pause → white flash → fading white
          orb.style.opacity = "0";
          orb.setAttribute("r", "5");
        } else if (elapsed < 5800) {
          // FOCUS: center dot builds as flash is fully gone
          const buildT = clamp01((elapsed - 5300) / 250);
          const dimT = clamp01((elapsed - 5550) / 250);
          orb.setAttribute("r", String(2 + easeOut(buildT) * 10));
          orb.style.opacity = String(Math.max(0, easeOut(buildT) - easeIn(dimT)) * 0.95);
        } else {
          orb.style.opacity = "0";
          orb.setAttribute("r", "5");
        }

        // ── Nova particles: emerge from screen edges as white fades (3800–5300ms) ──
        // Gated by (1 - flashAlpha) — opacity is zero while flash is white.
        if (elapsed >= 3800 && elapsed < 5300) {
          const inverseFlash = 1 - flashAlpha;
          const convT = (elapsed - 3800) / 1500;
          novaParticles.forEach((p) => {
            const pProgress = clamp01(convT - p.delay / 1000);
            const eased = easeIn(pProgress);
            const x = lerp(p.sx, CENTER_X, eased);
            const y = lerp(p.sy, CENTER_Y, eased);
            const o = (1 - eased) * 0.9 * inverseFlash;
            if (o <= 0.01) return;
            const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            c.setAttribute("cx", String(x));
            c.setAttribute("cy", String(y));
            c.setAttribute("r", String(3 + (1 - eased) * 4));
            c.setAttribute("fill", "rgba(255, 252, 230, 1)");
            c.setAttribute("class", "nova-p");
            c.style.opacity = String(o);
            svg.appendChild(c);
          });
        }
      }

      // ═══ CORE CEREMONY ══════════════════════════════════════════════════
      if (t >= 0) {
        // Phase: Gather (0-2s core)
        const gatherP = prog(t, TIMELINE.gather);
        if (gatherP > 0 && gatherP < 1) {
          particles.forEach((p) => {
            const pProgress = clamp01((t - p.delay) / 1500);
            if (pProgress <= 0) return;
            const eased = easeIn(pProgress);
            const x = lerp(p.sx, CENTER_X, eased);
            const y = lerp(p.sy, CENTER_Y, eased);
            const opacity = (1 - pProgress) * 0.4;

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", String(x));
            circle.setAttribute("cy", String(y));
            circle.setAttribute("r", "2");
            circle.setAttribute("fill", colors.warmGlow50);
            circle.setAttribute("class", "gather-particle");
            circle.style.opacity = String(opacity);
            svg.appendChild(circle);
          });
        }

        // Phase: Flash (1.8-3s core) — only fire if not already fired by supernova
        const flashP = prog(t, TIMELINE.flash);
        if (!flashFired && flashP > 0 && flash) {
          flash.style.animation = "screenFlash 1s ease-out forwards";
          flashFired = true;
        }

        // Orb appears at center
        if (t >= TIMELINE.flash.start && t < TIMELINE.corner.start) {
          const igniteP = clamp01((t - TIMELINE.flash.start) / 600);
          orb.style.opacity = String(easeOut(igniteP));
          orb.setAttribute("cx", String(CENTER_X));
          orb.setAttribute("cy", String(CENTER_Y));
        }

        // Border fade in
        if (flashP > 0) {
          border.style.opacity = String(0.12 + flashP * 0.15);
        }

        // Phase: Corner (3-4s core)
        if (t >= TIMELINE.corner.start && t < TIMELINE.corner.end) {
          const eased = easeInOut(prog(t, TIMELINE.corner));
          orb.style.opacity = "1";
          orb.setAttribute("cx", String(lerp(CENTER_X, FRAME_X, eased)));
          orb.setAttribute("cy", String(lerp(CENTER_Y, FRAME_Y, eased)));
        }

        // Phase: Loop (4-7.5s core)
        const loopP = prog(t, TIMELINE.loop);
        if (t >= TIMELINE.loop.start && t < TIMELINE.loop.end) {
          const pos = pointOnBorder(loopP);
          orb.style.opacity = "1";
          orb.setAttribute("cx", String(pos.x));
          orb.setAttribute("cy", String(pos.y));

          for (let i = 0; i < TRAIL_COUNT; i++) {
            const trail = trailRefs.current[i];
            if (!trail) continue;
            const trailFrac = loopP - TRAIL_LAG * (i + 1);
            if (trailFrac < 0) {
              trail.style.opacity = "0";
              continue;
            }
            const tp = pointOnBorder(trailFrac);
            trail.setAttribute("cx", String(tp.x));
            trail.setAttribute("cy", String(tp.y));
            trail.style.opacity = String(TRAIL_OPACITIES[i]);
          }

          border.style.opacity = String(0.27 + loopP * 0.15);
        }

        // Phase: Return (7.5-8.5s core)
        if (t >= TIMELINE.returnC.start && t < TIMELINE.returnC.end) {
          const lastPos = pointOnBorder(1);
          const eased = easeInOut(prog(t, TIMELINE.returnC));
          orb.setAttribute("cx", String(lerp(lastPos.x, CENTER_X, eased)));
          orb.setAttribute("cy", String(lerp(lastPos.y, CENTER_Y, eased)));
          for (let i = 0; i < TRAIL_COUNT; i++) {
            const trail = trailRefs.current[i];
            if (trail) trail.style.opacity = String(TRAIL_OPACITIES[i] * (1 - eased));
          }
        }

        // Phase: Fade (8.5-9.8s core)
        const fadeP = prog(t, TIMELINE.fade);
        if (t >= TIMELINE.fade.start && t < TIMELINE.fade.end) {
          orb.setAttribute("cx", String(CENTER_X));
          orb.setAttribute("cy", String(CENTER_Y));
          orb.style.opacity = String(1 - easeIn(fadeP));
          trailRefs.current.forEach((tr) => { if (tr) tr.style.opacity = "0"; });
        }

        // Phase: Hourglass (9.2-10.5s core)
        const hgP = prog(t, TIMELINE.hourglass);
        if (hgP > 0 && c1 && c2) {
          const curveOpacity = clamp01(hgP * 1.5);
          c1.style.opacity = String(curveOpacity);
          c2.style.opacity = String(curveOpacity);

          const dotOrder = [3, 2, 0, 1];
          dotOrder.forEach((idx, i) => {
            const dotP = clamp01((hgP - 0.3 - i * 0.1) * 3);
            const dot = dotRefs.current[idx];
            if (dot) dot.style.opacity = String(dotP);
          });
        }

        // Phase: Pulse (10.5s+ core)
        if (t >= TIMELINE.pulse.start) {
          const pulseT = ((t - TIMELINE.pulse.start) % 3000) / 3000;
          const pulseVal = 0.3 + 0.4 * Math.sin(pulseT * Math.PI * 2);
          border.style.opacity = String(pulseVal);
          border.style.strokeWidth = String(1.5 + Math.sin(pulseT * Math.PI * 2) * 0.5);
        }

        // Phase: Unlock (11s+ core)
        if (t >= TIMELINE.unlock.start && !showTapPhase) {
          setShowTapPhase(true);
        }

        // Settle final state
        if (t >= TIMELINE.fade.end) {
          orb.style.opacity = "0";
          trailRefs.current.forEach((tr) => { if (tr) tr.style.opacity = "0"; });
        }
      }

      if (elapsed < 15000 + PRELUDE) {
        rafId = requestAnimationFrame(animate);
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Screen flash */}
      <div
        ref={flashRef}
        style={{
          position: "fixed",
          inset: 0,
          background: [
            "radial-gradient(circle at center,",
            "  #ffffff         0%,",    // blazing white core
            "  #fffef0        25%,",    // still near-white
            "  rgba(255,245,200,0.98) 50%,",  // warm gold
            "  rgba(255,210,100,0.75) 70%,",  // amber halo
            "  rgba(240,140, 20,0.35) 85%,",  // corona
            "  transparent   100%",            // corners fade to black — circular shape reads
            ")",
          ].join(" "),
          opacity: 0,
          pointerEvents: "none",
          zIndex: 1000,
        }}
      />

      <div style={{ position: "relative", width: "200px", height: "260px" }}>
        <svg
          ref={svgRef}
          viewBox="0 0 200 260"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: "100%",
            height: "100%",
            overflow: "visible",
            opacity: showTapPhase ? 0 : 1,
            transition: "opacity 1.2s ease",
          }}
        >
          <defs>
            <filter id="puzzleOrbGlow" x="-500%" y="-500%" width="1100%" height="1100%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="soft" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="haze1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="25" result="haze2" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="50" result="bloom1" />
              <feMerge>
                <feMergeNode in="bloom1" />
                <feMergeNode in="haze2" />
                <feMergeNode in="haze1" />
                <feMergeNode in="soft" />
              </feMerge>
            </filter>
            <filter id="puzzleTrailGlow" x="-300%" y="-300%" width="700%" height="700%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="tsoft" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="tbloom" />
              <feMerge>
                <feMergeNode in="tbloom" />
                <feMergeNode in="tsoft" />
              </feMerge>
            </filter>
          </defs>

          {/* Frame border */}
          <rect
            ref={borderRef}
            x={FRAME_X} y={FRAME_Y} width={FRAME_W} height={FRAME_H} rx="2"
            fill="none" stroke={colors.gold} strokeWidth="1.5"
            style={{ opacity: 0 }}
          />

          {/* Trail orbs */}
          {TRAIL_RADII.map((r, i) => (
            <circle
              key={r}
              ref={(el) => { trailRefs.current[i] = el; }}
              cx="0" cy="0" r={r}
              fill={colors.warmGlow50}
              filter="url(#puzzleTrailGlow)"
              style={{ opacity: 0 }}
            />
          ))}

          {/* Main orb */}
          <circle
            ref={orbRef}
            cx={CENTER_X} cy={CENTER_Y} r="5"
            fill={colors.orbWhite90}
            filter="url(#puzzleOrbGlow)"
            style={{ opacity: 0 }}
          />

          {/* Hourglass curves */}
          <path
            ref={curve1Ref}
            d="M 64,65 C 64,130 136,112 136,176"
            fill="none" stroke={colors.gold} strokeWidth="1.5"
            style={{ opacity: 0 }}
          />
          <path
            ref={curve2Ref}
            d="M 136,65 C 136,130 64,112 64,176"
            fill="none" stroke={colors.gold} strokeWidth="1.5"
            style={{ opacity: 0 }}
          />

          {/* Sand dots */}
          {SAND_DOTS.map((pos, i) => (
            <circle
              key={`${pos.cx}-${pos.cy}`}
              ref={(el) => { dotRefs.current[i] = el; }}
              cx={pos.cx} cy={pos.cy} r="3"
              fill={colors.gold}
              style={{ opacity: 0 }}
            />
          ))}
        </svg>

        {/* TapToContinue — pre-mounted, invisible until showTapPhase triggers the stagger sequence */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "visible",
            pointerEvents: showTapPhase ? "auto" : "none",
          }}
        >
          <TapToContinue
            active={showTapPhase}
            instruction={unlockText}
            onComplete={onComplete}
            markerDelay={400}
            textDelay={700}
            tapDelay={900}
          />
        </div>
      </div>
    </>
  );
}

export const showcase: ShowcaseDefinition<UnlockAnimationProps> = {
  category: "game",
  label: "Unlock Animation",
  description: "Orb ceremony with optional supernova prelude",
  uses: ["TapToContinue"],
  defaults: { unlockText: "Press to Unlock", supernova: false },
  callbacks: { onComplete: "done" },
};
