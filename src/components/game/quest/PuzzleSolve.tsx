"use client";

import { useEffect, useRef, useState } from "react";
import {
  easeInOut, easeOut, easeIn, clamp01, lerp, prog, pointOnBorder,
  TIMELINE, FRAME_X, FRAME_Y, FRAME_W, FRAME_H,
  CENTER_X, CENTER_Y, TRAIL_COUNT, TRAIL_LAG, TRAIL_RADII, TRAIL_OPACITIES,
  SAND_DOTS,
} from "./puzzleSolveAnimation";

interface PuzzleSolveProps {
  onAdvance: () => void;
}

export default function PuzzleSolve({ onAdvance }: PuzzleSolveProps) {
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

    // Generate gather particles
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

      const orb = orbRef.current;
      const border = borderRef.current;
      const flash = flashRef.current;
      const c1 = curve1Ref.current;
      const c2 = curve2Ref.current;
      if (!orb || !border) { rafId = requestAnimationFrame(animate); return; }

      const svg = svgRef.current;
      if (!svg) { rafId = requestAnimationFrame(animate); return; }

      // Remove existing particle elements on each frame (simple approach)
      svg.querySelectorAll(".gather-particle").forEach((el) => el.remove());

      // Phase: Gather (0-2s) - particles converge to center
      const gatherP = prog(elapsed, TIMELINE.gather);
      if (gatherP > 0 && gatherP < 1) {
        particles.forEach((p) => {
          const pProgress = clamp01((elapsed - p.delay) / 1500);
          if (pProgress <= 0) return;
          const eased = easeIn(pProgress);
          const x = lerp(p.sx, CENTER_X, eased);
          const y = lerp(p.sy, CENTER_Y, eased);
          const opacity = (1 - pProgress) * 0.4;

          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute("cx", String(x));
          circle.setAttribute("cy", String(y));
          circle.setAttribute("r", "2");
          circle.setAttribute("fill", "rgba(255, 248, 220, 0.5)");
          circle.setAttribute("class", "gather-particle");
          circle.style.opacity = String(opacity);
          svg.appendChild(circle);
        });
      }

      // Phase: Flash (1.8-3s)
      const flashP = prog(elapsed, TIMELINE.flash);
      if (flashP > 0 && !flashFired && flash) {
        flash.style.animation = "screenFlash 1s ease-out forwards";
        flashFired = true;
      }

      // Orb appears at center
      if (elapsed >= TIMELINE.flash.start && elapsed < TIMELINE.corner.start) {
        const igniteP = clamp01((elapsed - TIMELINE.flash.start) / 600);
        orb.style.opacity = String(easeOut(igniteP));
        orb.setAttribute("cx", String(CENTER_X));
        orb.setAttribute("cy", String(CENTER_Y));
      }

      // Border fade in
      if (flashP > 0) {
        border.style.opacity = String(0.12 + flashP * 0.15);
      }

      // Phase: Corner (3-4s) - orb moves to upper-left
      const cornerP = prog(elapsed, TIMELINE.corner);
      if (elapsed >= TIMELINE.corner.start && elapsed < TIMELINE.corner.end) {
        const eased = easeInOut(cornerP);
        orb.style.opacity = "1";
        orb.setAttribute("cx", String(lerp(CENTER_X, FRAME_X, eased)));
        orb.setAttribute("cy", String(lerp(CENTER_Y, FRAME_Y, eased)));
      }

      // Phase: Loop (4-7.5s) - orb traces frame perimeter
      const loopP = prog(elapsed, TIMELINE.loop);
      if (elapsed >= TIMELINE.loop.start && elapsed < TIMELINE.loop.end) {
        const pos = pointOnBorder(loopP);
        orb.style.opacity = "1";
        orb.setAttribute("cx", String(pos.x));
        orb.setAttribute("cy", String(pos.y));

        // Trail orbs
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

      // Phase: Return (7.5-8.5s) - orb returns to center
      const returnP = prog(elapsed, TIMELINE.returnC);
      if (elapsed >= TIMELINE.returnC.start && elapsed < TIMELINE.returnC.end) {
        const lastPos = pointOnBorder(1);
        const eased = easeInOut(returnP);
        orb.setAttribute("cx", String(lerp(lastPos.x, CENTER_X, eased)));
        orb.setAttribute("cy", String(lerp(lastPos.y, CENTER_Y, eased)));
        // Fade trails
        for (let i = 0; i < TRAIL_COUNT; i++) {
          const trail = trailRefs.current[i];
          if (trail) trail.style.opacity = String(TRAIL_OPACITIES[i] * (1 - eased));
        }
      }

      // Phase: Fade (8.5-9.8s) - orb fades out
      const fadeP = prog(elapsed, TIMELINE.fade);
      if (elapsed >= TIMELINE.fade.start && elapsed < TIMELINE.fade.end) {
        orb.setAttribute("cx", String(CENTER_X));
        orb.setAttribute("cy", String(CENTER_Y));
        orb.style.opacity = String(1 - easeIn(fadeP));
        trailRefs.current.forEach((t) => { if (t) t.style.opacity = "0"; });
      }

      // Phase: Hourglass (9.2-10.5s)
      const hgP = prog(elapsed, TIMELINE.hourglass);
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

      // Phase: Pulse (10.5s+) - border pulses
      if (elapsed >= TIMELINE.pulse.start) {
        const pulseT = ((elapsed - TIMELINE.pulse.start) % 3000) / 3000;
        const pulseVal = 0.3 + 0.4 * Math.sin(pulseT * Math.PI * 2);
        border.style.opacity = String(pulseVal);
        border.style.strokeWidth = String(1.5 + Math.sin(pulseT * Math.PI * 2) * 0.5);
      }

      // Phase: Unlock (11s+)
      if (elapsed >= TIMELINE.unlock.start && !showUnlock) {
        setShowUnlock(true);
      }

      // Settle final state
      if (elapsed >= TIMELINE.fade.end) {
        orb.style.opacity = "0";
        trailRefs.current.forEach((t) => { if (t) t.style.opacity = "0"; });
      }

      if (elapsed < 15000) {
        rafId = requestAnimationFrame(animate);
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {/* Screen flash */}
      <div
        ref={flashRef}
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(255,251,230,0.25) 0%, transparent 60%)",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      {/* Ambient drift particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "2px",
            height: "2px",
            borderRadius: "50%",
            background: "rgba(200, 165, 75, 0.2)",
            left: `${15 + i * 13}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `drift ${5 + i * 1.2}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}

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
            fill="none" stroke="#C9A84C" strokeWidth="1.5"
            style={{ opacity: 0 }}
          />

          {/* Trail orbs */}
          {TRAIL_RADII.map((r, i) => (
            <circle
              key={r}
              ref={(el) => { trailRefs.current[i] = el; }}
              cx="0" cy="0" r={r}
              fill="rgba(255, 248, 220, 0.5)"
              filter="url(#puzzleTrailGlow)"
              style={{ opacity: 0 }}
            />
          ))}

          {/* Main orb */}
          <circle
            ref={orbRef}
            cx={CENTER_X} cy={CENTER_Y} r="5"
            fill="rgba(255, 253, 240, 0.9)"
            filter="url(#puzzleOrbGlow)"
            style={{ opacity: 0 }}
          />

          {/* Hourglass curves */}
          <path
            ref={curve1Ref}
            d="M 64,65 C 64,130 136,112 136,176"
            fill="none" stroke="#C9A84C" strokeWidth="1.5"
            style={{ opacity: 0 }}
          />
          <path
            ref={curve2Ref}
            d="M 136,65 C 136,130 64,112 64,176"
            fill="none" stroke="#C9A84C" strokeWidth="1.5"
            style={{ opacity: 0 }}
          />

          {/* Sand dots */}
          {SAND_DOTS.map((pos, i) => (
            <circle
              key={`${pos.cx}-${pos.cy}`}
              ref={(el) => { dotRefs.current[i] = el; }}
              cx={pos.cx} cy={pos.cy} r="3"
              fill="#C9A84C"
              style={{ opacity: 0 }}
            />
          ))}
        </svg>
      </div>

      {/* Press to Unlock */}
      {showUnlock && (
        <button
          onClick={onAdvance}
          style={{
            marginTop: "32px",
            background: "none",
            border: "none",
            color: "rgba(200, 165, 75, 0.7)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "14px",
            fontStyle: "italic",
            letterSpacing: "2px",
            cursor: "pointer",
            padding: "12px 24px",
            minHeight: "44px",
            WebkitTapHighlightColor: "transparent",
            opacity: 0,
            animation: "pulse-soft 3s ease-in-out infinite, fade-in 0.8s ease forwards",
          }}
        >
          Press to Unlock
        </button>
      )}

      <style>{`
        @keyframes screenFlash {
          0% { opacity: 0; }
          10% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
