"use client";

import { useEffect, useRef, useState } from "react";
import TextButton from "@/components/ui/TextButton";
import { colors } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";
import {
  easeInOut, easeOut, easeIn, clamp01, lerp, prog, pointOnBorder,
  TIMELINE, FRAME_X, FRAME_Y, FRAME_W, FRAME_H,
  CENTER_X, CENTER_Y, TRAIL_COUNT, TRAIL_LAG, TRAIL_RADII, TRAIL_OPACITIES,
  SAND_DOTS,
} from "./puzzleSolveAnimation";

interface CeremonyAnimationProps {
  onComplete: () => void;
  unlockText?: string;
  supernova?: boolean;
}

export default function CeremonyAnimation({
  onComplete,
  unlockText = "Press to Unlock",
  supernova = false,
}: CeremonyAnimationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const orbRef = useRef<SVGCircleElement>(null);
  const borderRef = useRef<SVGRectElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(SVGCircleElement | null)[]>([]);
  const curve1Ref = useRef<SVGPathElement>(null);
  const curve2Ref = useRef<SVGPathElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const [showUnlock, setShowUnlock] = useState(false);

  useEffect(() => {
    let animStart: number | null = null;
    let rafId: number;
    let flashFired = false;
    const PRELUDE = supernova ? 2000 : 0;

    const particles: { sx: number; sy: number; delay: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      particles.push({
        sx: CENTER_X + Math.cos(angle) * 200,
        sy: CENTER_Y + Math.sin(angle) * 200,
        delay: Math.random() * 800,
      });
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
      if (supernova && elapsed < PRELUDE) {
        // Ignite: orb grows bright at center (0-400ms)
        if (elapsed < 400) {
          const p = easeOut(elapsed / 400);
          orb.setAttribute("r", String(2 + p * 20));
          orb.setAttribute("cx", String(CENTER_X));
          orb.setAttribute("cy", String(CENTER_Y));
          orb.style.opacity = String(p);
        }

        // Screen flash (200ms)
        if (elapsed >= 200 && !flashFired && flash) {
          flash.style.animation = "screenFlash 1.2s ease-out forwards";
          flashFired = true;
        }

        // Burst: particles fly outward from center (100-1400ms)
        if (elapsed >= 100 && elapsed < 1400) {
          const burstT = (elapsed - 100) / 1300;
          particles.forEach((p) => {
            const stagger = clamp01(burstT - p.delay / 2000);
            if (stagger <= 0) return;
            const e = easeOut(stagger);
            const x = lerp(CENTER_X, p.sx, e);
            const y = lerp(CENTER_Y, p.sy, e);
            const o = (1 - stagger) * 0.5;

            const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            c.setAttribute("cx", String(x));
            c.setAttribute("cy", String(y));
            c.setAttribute("r", String(2 + (1 - stagger) * 2));
            c.setAttribute("fill", colors.warmGlow60);
            c.setAttribute("class", "nova-p");
            c.style.opacity = String(o);
            svg.appendChild(c);
          });
        }

        // Shockwave ring (200-1200ms)
        if (elapsed >= 200 && elapsed < 1200) {
          const ringT = (elapsed - 200) / 1000;
          const ringR = easeOut(ringT) * 160;
          const ringO = (1 - ringT) * 0.35;
          const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          ring.setAttribute("cx", String(CENTER_X));
          ring.setAttribute("cy", String(CENTER_Y));
          ring.setAttribute("r", String(ringR));
          ring.setAttribute("fill", "none");
          ring.setAttribute("stroke", colors.warmGlow40);
          ring.setAttribute("stroke-width", String(2.5 - ringT * 2));
          ring.setAttribute("class", "nova-p");
          ring.style.opacity = String(ringO);
          svg.appendChild(ring);
        }

        // Fade supernova orb (400-1800ms)
        if (elapsed >= 400 && elapsed < 1800) {
          const fadeT = clamp01((elapsed - 400) / 1400);
          orb.setAttribute("r", String(lerp(22, 5, easeIn(fadeT))));
          orb.style.opacity = String(1 - easeIn(fadeT));
        }

        // Dark settle (1800-2000ms)
        if (elapsed >= 1800) {
          orb.style.opacity = "0";
          orb.setAttribute("r", "5");
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
        if (t >= TIMELINE.unlock.start && !showUnlock) {
          setShowUnlock(true);
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
          background:
            `radial-gradient(ellipse at center, ${colors.flashWhite25} 0%, transparent 60%)`,
          opacity: 0,
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      <div style={{ position: "relative", width: "200px", height: "260px" }}>
        <svg
          ref={svgRef}
          viewBox="0 0 200 260"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
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
      </div>

      {/* Press to Unlock */}
      {showUnlock && (
        <TextButton
          onClick={onComplete}
          style={{
            marginTop: "32px",
            fontSize: "14px",
            letterSpacing: "2px",
            padding: "12px 24px",
            opacity: 0,
            animation: "pulse-soft 3s ease-in-out infinite, fade-in 0.8s ease forwards",
          }}
        >
          {unlockText}
        </TextButton>
      )}
    </>
  );
}

export const showcase: ShowcaseDefinition<CeremonyAnimationProps> = {
  category: "game",
  label: "Ceremony Animation",
  description: "Orb ceremony with optional supernova prelude",
  uses: ["TextButton"],
  defaults: { unlockText: "Press to Unlock", supernova: false },
  callbacks: { onComplete: "done" },
};
