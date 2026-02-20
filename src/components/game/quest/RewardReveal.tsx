"use client";

import { useState, useEffect, useRef } from "react";
import type { RewardRevealConfig } from "@/config";
import {
  easeInOut, easeOut, easeIn, clamp01, lerp, prog, pointOnBorder,
  TIMELINE, FRAME_X, FRAME_Y, FRAME_W, FRAME_H,
  CENTER_X, CENTER_Y, TRAIL_COUNT, TRAIL_LAG, TRAIL_RADII, TRAIL_OPACITIES,
  SAND_DOTS,
} from "./puzzleSolveAnimation";

interface RewardRevealProps {
  config: RewardRevealConfig;
  onAdvance: () => void;
  chapterName?: string;
}

export default function RewardReveal({ config, onAdvance, chapterName }: RewardRevealProps) {
  const [phase, setPhase] = useState<"ceremony" | "text">("ceremony");

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
      {/* Ambient drift particles (shared across phases) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "2px",
            height: "2px",
            borderRadius: "50%",
            background: "rgba(200, 165, 75, 0.3)",
            left: `${15 + i * 13}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `drift ${5 + i * 1.2}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}

      {phase === "ceremony" ? (
        <CeremonyPhase onUnlock={() => setPhase("text")} />
      ) : (
        <TextPhase config={config} onAdvance={onAdvance} chapterName={chapterName} />
      )}
    </div>
  );
}

/* ─── Ceremony Phase ──────────────────────────────────────────────────────── */

function CeremonyPhase({ onUnlock }: { onUnlock: () => void }) {
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
    const NOVA = 2000; // supernova duration before core ceremony

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
      const t = elapsed - NOVA; // core ceremony time (negative = still in supernova)

      const orb = orbRef.current;
      const border = borderRef.current;
      const flash = flashRef.current;
      const c1 = curve1Ref.current;
      const c2 = curve2Ref.current;
      if (!orb || !border) { rafId = requestAnimationFrame(animate); return; }

      const svg = svgRef.current;
      if (!svg) { rafId = requestAnimationFrame(animate); return; }

      // Clean up dynamic SVG particles each frame
      svg.querySelectorAll(".nova-p,.gather-particle").forEach((el) => el.remove());

      // ═══ SUPERNOVA (0 – 2s) ═══════════════════════════════════════════════
      if (elapsed < NOVA) {
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
            c.setAttribute("fill", "rgba(255, 248, 220, 0.6)");
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
          ring.setAttribute("stroke", "rgba(255, 248, 220, 0.4)");
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

        // Dark settle (1800-2000ms) — orb invisible, reset radius
        if (elapsed >= 1800) {
          orb.style.opacity = "0";
          orb.setAttribute("r", "5");
        }
      }

      // ═══ CORE CEREMONY (uses t = elapsed - NOVA) ══════════════════════════
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
            circle.setAttribute("fill", "rgba(255, 248, 220, 0.5)");
            circle.setAttribute("class", "gather-particle");
            circle.style.opacity = String(opacity);
            svg.appendChild(circle);
          });
        }

        // Phase: Flash (1.8-3s core) — screen flash already fired during supernova
        const flashP = prog(t, TIMELINE.flash);

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

      if (elapsed < 15000 + NOVA) {
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
            "radial-gradient(ellipse at center, rgba(255,251,230,0.25) 0%, transparent 60%)",
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
          onClick={onUnlock}
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
    </>
  );
}

/* ─── Text Phase ──────────────────────────────────────────────────────────── */

function TextPhase({
  config,
  onAdvance,
  chapterName,
}: {
  config: RewardRevealConfig;
  onAdvance: () => void;
  chapterName?: string;
}) {
  const [showTitle, setShowTitle] = useState(false);
  const [showLines, setShowLines] = useState<boolean[]>([]);
  const [showSecondary, setShowSecondary] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const primaryLines = config.primary
    .split(/(?<=\.)\s+/)
    .filter((l) => l.trim().length > 0);

  useEffect(() => {
    const timers = timersRef.current;
    timers.push(setTimeout(() => setShowTitle(true), 600));

    const lineDelays = [1800, 3200, 5000];
    primaryLines.forEach((_, i) => {
      const delay = lineDelays[i] ?? lineDelays[lineDelays.length - 1] + (i - 2) * 1800;
      timers.push(
        setTimeout(() => {
          setShowLines((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, delay)
      );
    });

    const lastLineDelay = lineDelays[Math.min(primaryLines.length - 1, lineDelays.length - 1)] ?? 5000;

    if (config.secondary) {
      timers.push(setTimeout(() => setShowSecondary(true), lastLineDelay + 1500));
      timers.push(setTimeout(() => setShowContinue(true), lastLineDelay + 3000));
    } else {
      timers.push(setTimeout(() => setShowContinue(true), lastLineDelay + 2000));
    }

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "15vh",
        padding: "15vh 24px 40px",
        gap: "12px",
        opacity: 0,
        animation: "fade-in 0.8s ease forwards",
        width: "100%",
      }}
    >
      {/* Particle field */}
      {Array.from({ length: 14 }).map((_, i) => {
        const variant = i % 3;
        const xDrift = 30 + (i % 5) * 12;
        const yDrift = 25 + (i % 4) * 10;
        return (
          <div
            key={`tp-${i}`}
            style={{
              position: "absolute",
              width: variant === 0 ? "3px" : "2px",
              height: variant === 0 ? "3px" : "2px",
              borderRadius: "50%",
              background: `rgba(200, 165, 75, ${0.15 + (i % 4) * 0.05})`,
              left: `${8 + ((i * 17 + 5) % 84)}%`,
              top: `${6 + ((i * 23 + 11) % 82)}%`,
              animation: `rewardDrift-${i % 4} ${6 + (i % 5) * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
              willChange: "transform, opacity",
              // Unique per-particle path via CSS custom properties
              ["--xd" as string]: `${i % 2 === 0 ? xDrift : -xDrift}px`,
              ["--yd" as string]: `${i % 3 === 0 ? -yDrift : yDrift}px`,
            }}
          />
        );
      })}

      <style>{`
        @keyframes rewardDrift-0 {
          0%   { opacity: 0.1; transform: translate(0, 0); }
          25%  { opacity: 0.35; transform: translate(35px, -20px); }
          50%  { opacity: 0.15; transform: translate(-15px, -45px); }
          75%  { opacity: 0.3; transform: translate(20px, -25px); }
          100% { opacity: 0.1; transform: translate(0, 0); }
        }
        @keyframes rewardDrift-1 {
          0%   { opacity: 0.15; transform: translate(0, 0); }
          25%  { opacity: 0.3; transform: translate(-30px, -30px); }
          50%  { opacity: 0.1; transform: translate(-50px, 10px); }
          75%  { opacity: 0.35; transform: translate(-20px, -40px); }
          100% { opacity: 0.15; transform: translate(0, 0); }
        }
        @keyframes rewardDrift-2 {
          0%   { opacity: 0.1; transform: translate(0, 0); }
          25%  { opacity: 0.25; transform: translate(25px, 30px); }
          50%  { opacity: 0.35; transform: translate(45px, -15px); }
          75%  { opacity: 0.15; transform: translate(10px, 20px); }
          100% { opacity: 0.1; transform: translate(0, 0); }
        }
        @keyframes rewardDrift-3 {
          0%   { opacity: 0.15; transform: translate(0, 0); }
          25%  { opacity: 0.2; transform: translate(-40px, 20px); }
          50%  { opacity: 0.3; transform: translate(10px, 40px); }
          75%  { opacity: 0.25; transform: translate(-25px, -15px); }
          100% { opacity: 0.15; transform: translate(0, 0); }
        }
      `}</style>

      {/* Chapter title */}
      {chapterName && (
        <p
          style={{
            opacity: showTitle ? 1 : 0,
            transform: showTitle ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
            color: "rgba(200, 165, 75, 0.5)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "3px",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          {chapterName}
        </p>
      )}

      {/* Primary text lines */}
      {primaryLines.map((line, i) => (
        <p
          key={`${i}-${line}`}
          style={{
            opacity: showLines[i] ? 1 : 0,
            transform: showLines[i] ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
            color: "rgba(200, 165, 75, 0.9)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "18px",
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.8,
            maxWidth: "340px",
          }}
        >
          {line}
        </p>
      ))}

      {/* Continue button */}
      <button
        onClick={onAdvance}
        style={{
          opacity: showContinue ? 1 : 0,
          transition: "opacity 0.8s ease",
          background: "none",
          border: "1px solid rgba(200, 165, 75, 0.3)",
          color: "rgba(200, 165, 75, 0.7)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "14px",
          fontStyle: "italic",
          letterSpacing: "2px",
          padding: "12px 28px",
          marginTop: "24px",
          cursor: showContinue ? "pointer" : "default",
          minHeight: "44px",
          minWidth: "44px",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        Continue
      </button>

      {/* Secondary text — below continue */}
      {config.secondary && (
        <p
          style={{
            opacity: showSecondary ? 0.7 : 0,
            transform: showSecondary ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
            color: "rgba(200, 165, 75, 0.7)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "14px",
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.8,
            maxWidth: "300px",
            marginTop: "16px",
          }}
        >
          {config.secondary}
        </p>
      )}
    </div>
  );
}
