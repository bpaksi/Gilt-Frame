"use client";

import { useEffect, useRef } from "react";
import { colors } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface OrbAnimationProps {
  onComplete: () => void;
  delayMs?: number;
}

function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeIn(t: number) { return t * t; }
function clamp01(t: number) { return Math.max(0, Math.min(1, t)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function prog(elapsed: number, phase: { start: number; end: number }) {
  return clamp01((elapsed - phase.start) / (phase.end - phase.start));
}

const TIMELINE = {
  ignite:       { start: 0,     end: 1200 },
  borderFade:   { start: 800,   end: 2200 },
  moveToCorner: { start: 2000,  end: 3500 },
  loopBorder:   { start: 3500,  end: 9500 },
  moveToCenter: { start: 9500,  end: 10700 },
  fadeOutOrb:   { start: 10700, end: 12200 },
  hourglassIn:  { start: 11700, end: 13500 },
  fieldsIn:     { start: 13500, end: 15500 },
};

const CENTER_X = 100;
const CENTER_Y = 130;
const CORNER_X = 10;
const CORNER_Y = 10;
const TRAIL_COUNT = 5;
const TRAIL_LAG = 0.015;
const TRAIL_OPACITIES = [0.35, 0.25, 0.18, 0.12, 0.07];

export default function OrbAnimation({ onComplete, delayMs = 800 }: OrbAnimationProps) {
  const orbRef = useRef<SVGCircleElement>(null);
  const orbPathRef = useRef<SVGPathElement>(null);
  const afterglowRef = useRef<SVGRectElement>(null);
  const markerBorderRef = useRef<SVGRectElement>(null);
  const curve1Ref = useRef<SVGPathElement>(null);
  const curve2Ref = useRef<SVGPathElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(SVGCircleElement | null)[]>([]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const completedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const orb = orbRef.current;
      const orbPath = orbPathRef.current;
      const afterglow = afterglowRef.current;
      const markerBorder = markerBorderRef.current;
      const curve1 = curve1Ref.current;
      const curve2 = curve2Ref.current;
      const flash = flashRef.current;

      if (!orb || !orbPath || !afterglow || !markerBorder || !curve1 || !curve2) return;

      // Explicit typed aliases so TypeScript maintains non-null type in closures
      const safeOrb: SVGCircleElement = orb;
      const safeOrbPath: SVGPathElement = orbPath;
      const safeAfterGlow: SVGRectElement = afterglow;
      const safeMarkerBorder: SVGRectElement = markerBorder;
      const safeCurve1: SVGPathElement = curve1;
      const safeCurve2: SVGPathElement = curve2;

      const pathLength = safeOrbPath.getTotalLength();
      let animStart: number | null = null;
      let flashFired = false;
      let rafId: number;

      function setOrbPos(x: number, y: number) {
        safeOrb.setAttribute("cx", String(x));
        safeOrb.setAttribute("cy", String(y));
      }

      function animate(timestamp: number) {
        if (!animStart) animStart = timestamp;
        const elapsed = timestamp - animStart;

        // Phase 1: Star fades in at center
        const igniteP = prog(elapsed, TIMELINE.ignite);
        if (igniteP > 0 && !flashFired && flash) {
          flash.style.animation = "screenFlash 1s ease-out forwards";
          flashFired = true;
        }

        if (elapsed < TIMELINE.moveToCorner.start) {
          safeOrb.style.opacity = String(easeOut(igniteP));
          setOrbPos(CENTER_X, CENTER_Y);
        }

        // Phase 2: Border fades in
        const borderP = prog(elapsed, TIMELINE.borderFade);
        if (borderP > 0) {
          safeMarkerBorder.style.opacity = String(0.12 + borderP * 0.15);
        }

        // Phase 3: Move to upper-left corner
        const moveP = prog(elapsed, TIMELINE.moveToCorner);
        if (elapsed >= TIMELINE.moveToCorner.start && elapsed < TIMELINE.moveToCorner.end) {
          const eased = easeInOut(moveP);
          safeOrb.style.opacity = "1";
          setOrbPos(lerp(CENTER_X, CORNER_X, eased), lerp(CENTER_Y, CORNER_Y, eased));
        }

        // Phase 4: Loop border 1.5 times
        const loopP = prog(elapsed, TIMELINE.loopBorder);
        if (elapsed >= TIMELINE.loopBorder.start && elapsed < TIMELINE.loopBorder.end) {
          const loopFraction = loopP * 1.5;
          const pathFraction = loopFraction % 1.0;
          const point = safeOrbPath.getPointAtLength(pathFraction * pathLength);
          safeOrb.style.opacity = "1";
          setOrbPos(point.x, point.y);

          for (let i = 0; i < TRAIL_COUNT; i++) {
            let trailFrac = pathFraction - TRAIL_LAG * (i + 1);
            const trail = trailRefs.current[i];
            if (!trail) continue;
            if (trailFrac < 0) {
              if (loopFraction > 1) {
                trailFrac += 1;
              } else {
                trail.style.opacity = "0";
                continue;
              }
            }
            const tp = safeOrbPath.getPointAtLength(trailFrac * pathLength);
            trail.setAttribute("cx", String(tp.x));
            trail.setAttribute("cy", String(tp.y));
            trail.style.opacity = String(TRAIL_OPACITIES[i]);
          }

          safeMarkerBorder.style.opacity = String(0.27 + loopP * 0.15);
        }

        // Phase 5: Move back to center
        const toCenterP = prog(elapsed, TIMELINE.moveToCenter);
        if (elapsed >= TIMELINE.moveToCenter.start && elapsed < TIMELINE.moveToCenter.end) {
          const endPoint = safeOrbPath.getPointAtLength(0.5 * pathLength);
          const easedTC = easeInOut(toCenterP);
          safeOrb.style.opacity = "1";
          setOrbPos(lerp(endPoint.x, CENTER_X, easedTC), lerp(endPoint.y, CENTER_Y, easedTC));
          for (let i = 0; i < TRAIL_COUNT; i++) {
            const trail = trailRefs.current[i];
            if (trail) trail.style.opacity = String(TRAIL_OPACITIES[i] * (1 - easedTC));
          }
        }

        // Phase 6: Fade out the orb
        const fadeOrbP = prog(elapsed, TIMELINE.fadeOutOrb);
        if (elapsed >= TIMELINE.fadeOutOrb.start && elapsed < TIMELINE.fadeOutOrb.end) {
          setOrbPos(CENTER_X, CENTER_Y);
          safeOrb.style.opacity = String(1 - easeIn(fadeOrbP));
          trailRefs.current.forEach((t) => { if (t) t.style.opacity = "0"; });
          safeAfterGlow.style.opacity = String(fadeOrbP * 0.8);
        }

        // Phase 7: Fade in hourglass + sand
        const hgP = prog(elapsed, TIMELINE.hourglassIn);
        if (hgP > 0) {
          const curveOpacity = clamp01(hgP * 1.5);
          safeCurve1.style.opacity = String(curveOpacity);
          safeCurve2.style.opacity = String(curveOpacity);

          const dotOrder = [3, 2, 0, 1];
          dotOrder.forEach((idx, i) => {
            const dotP = clamp01((hgP - 0.3 - i * 0.1) * 3);
            const dot = dotRefs.current[idx];
            if (dot) dot.style.opacity = String(dotP);
          });
        }

        // Phase 8: Fields fade in — trigger onComplete
        const fieldsP = prog(elapsed, TIMELINE.fieldsIn);
        if (fieldsP > 0 && !completedRef.current) {
          completedRef.current = true;
          onComplete();
        }

        // Settle final state
        if (elapsed >= TIMELINE.fadeOutOrb.end) {
          safeOrb.style.opacity = "0";
          trailRefs.current.forEach((t) => { if (t) t.style.opacity = "0"; });
          safeAfterGlow.style.opacity = "0.8";
          safeMarkerBorder.style.opacity = "0.25";
        }

        if (elapsed < TIMELINE.fieldsIn.end + 1000) {
          rafId = requestAnimationFrame(animate);
        }
      }

      rafId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafId);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [onComplete, delayMs]);

  return (
    <>
      <div
        ref={flashRef}
        style={{
          position: "fixed",
          inset: 0,
          background: `radial-gradient(ellipse at center, ${colors.flashWhite25} 0%, transparent 60%)`,
          opacity: 0,
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      <div style={{ position: "relative", width: "200px", height: "260px" }}>
        <svg
          viewBox="0 0 200 260"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          <defs>
            <filter id="fuzzyOrbGlow" x="-500%" y="-500%" width="1100%" height="1100%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="soft" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="haze1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="25" result="haze2" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="50" result="bloom1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="90" result="bloom2" />
              <feMerge>
                <feMergeNode in="bloom2" />
                <feMergeNode in="bloom1" />
                <feMergeNode in="haze2" />
                <feMergeNode in="haze1" />
                <feMergeNode in="soft" />
              </feMerge>
            </filter>
            <filter id="trailGlow" x="-300%" y="-300%" width="700%" height="700%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="tsoft" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="tbloom" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="35" result="twide" />
              <feMerge>
                <feMergeNode in="twide" />
                <feMergeNode in="tbloom" />
                <feMergeNode in="tsoft" />
              </feMerge>
            </filter>
            <filter id="softAfterGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect
            ref={markerBorderRef}
            x="10" y="10" width="180" height="240" rx="2"
            fill="none" stroke={colors.gold} strokeWidth="1"
            style={{ opacity: 0 }}
          />
          <rect
            ref={afterglowRef}
            x="10" y="10" width="180" height="240" rx="2"
            fill="none" stroke={colors.gold} strokeWidth="1.5"
            filter="url(#softAfterGlow)"
            style={{ opacity: 0 }}
          />
          <path
            ref={orbPathRef}
            d="M 10,10 L 190,10 L 190,250 L 10,250 Z"
            fill="none" stroke="none"
          />
          {([6, 5, 4, 3.5, 3] as const).map((r, i) => (
            <circle
              key={r}
              ref={(el) => { trailRefs.current[i] = el; }}
              cx="0" cy="0" r={r}
              fill={colors.warmGlow50}
              filter="url(#trailGlow)"
              style={{ opacity: 0 }}
            />
          ))}
          <circle
            ref={orbRef}
            cx={CENTER_X} cy={CENTER_Y} r="5"
            fill={colors.orbWhite90}
            filter="url(#fuzzyOrbGlow)"
            style={{ opacity: 0 }}
          />
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
          {([
            { cx: 91,  cy: 172 },
            { cx: 109, cy: 172 },
            { cx: 100, cy: 158 },
            { cx: 100, cy: 84  },
          ] as const).map((pos, i) => (
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

    </>
  );
}

export const showcase: ShowcaseDefinition<OrbAnimationProps> = {
  category: "game",
  label: "Orb Animation",
  description: "8-phase orb ceremony tracing the gilt frame border",
  defaults: {},
  callbacks: { onComplete: "done" },
};
