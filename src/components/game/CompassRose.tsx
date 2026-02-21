"use client";

import { useRef, useEffect } from "react";
import { useDeviceOrientation } from "@/lib/hooks/useDeviceOrientation";
import { haversineDistance, bearingTo } from "@/lib/geo";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function angularDistance(a: number, b: number) {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

function signedAngularDistance(heading: number, target: number) {
  let d = heading - target;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

// ── Public frame-data types ───────────────────────────────────────────────────

export type NavigateFrameData = {
  heading: number;
  /** Metres to target, or null when GPS/target unavailable. */
  distance: number | null;
};

export type AlignFrameData = {
  heading: number;
  /** 0–1: how close to target bearing. */
  proximity: number;
  isOnTarget: boolean;
  hasRotatedEnough: boolean;
  /** 0–1: hold-timer progress. */
  holdProgress: number;
  /** Pixel offsets for shake effect, derived from hold progress. */
  shakeX: number;
  shakeY: number;
};

// ── Props ─────────────────────────────────────────────────────────────────────

type NavigateMode = {
  mode: "navigate";
  /** Current device GPS position. Arrow is hidden when null/undefined. */
  lat?: number | null;
  lng?: number | null;
  targetLat?: number;
  targetLng?: number;
  /** Called each RAF frame — use for distance text, geofence checks, etc. */
  onFrame?: (data: NavigateFrameData) => void;
};

type AlignMode = {
  mode: "align";
  /** Target bearing in degrees (0–359). */
  target: number;
  /** Angular tolerance for "on target" in degrees. Default 8. */
  tolerance?: number;
  /** Minimum sweep each direction before hold activates. Default 45. */
  minRotation?: number;
  /** Seconds to hold on target to solve. Default 1.5. */
  holdSeconds?: number;
  /** Called once when hold timer completes. */
  onSolved?: () => void;
  /** Called each RAF frame — use to drive external DOM elements. */
  onFrame?: (data: AlignFrameData) => void;
};

export type CompassRoseProps = { size?: number } & (NavigateMode | AlignMode);

// ── Component ─────────────────────────────────────────────────────────────────

const DEFAULT_SIZE = 560;

/**
 * GAME component: canvas compass rose with device-orientation-driven heading.
 *
 * - `navigate` mode: ring + cardinals + bearing arrow toward GPS target.
 * - `align`   mode: ring + cardinals + fixed needle; reports proximity/hold
 *   data via `onFrame` so the parent can drive external DOM elements.
 *
 * Owns the orientation hook and desktop mouse simulation internally.
 * Used by FindByGps (navigate) and BearingPuzzle (align).
 */
export default function CompassRose(props: CompassRoseProps) {
  const { size = DEFAULT_SIZE } = props;
  const CENTER = size / 2;
  // Scale ring radius proportionally from the navigate-mode baseline (230/560)
  const RING_R = Math.round(size * (230 / 560));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const orientation = useDeviceOrientation();
  const isDesktop = typeof window !== "undefined" && !("ontouchstart" in window);

  // Desktop mouse sim — canvas-relative, corrected for CSS scaling
  const mouseRef = useRef<{ x: number; y: number }>({ x: CENTER, y: CENTER });

  // Align-mode tracking refs (persist across RAF restarts)
  const solvedRef = useRef(false);
  const maxCWRef = useRef(0);
  const maxCCWRef = useRef(0);
  const holdStartRef = useRef<number | null>(null);

  // Store all props + orientation in refs so the RAF loop always reads the latest
  // values without needing to restart on every prop/heading change.
  const propsRef = useRef(props);
  const orientationRef = useRef(orientation.heading);
  useEffect(() => {
    propsRef.current = props;
    orientationRef.current = orientation.heading;
  }); // no deps — syncs after every render

  // Desktop mouse tracking
  useEffect(() => {
    if (!isDesktop) return;
    const onMouse = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) * (size / rect.width),
        y: (e.clientY - rect.top) * (size / rect.height),
      };
    };
    window.addEventListener("mousemove", onMouse);
    return () => window.removeEventListener("mousemove", onMouse);
  }, [isDesktop, size]);

  // Main RAF draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function getHeading(): number {
      if (orientationRef.current !== null) return orientationRef.current;
      if (isDesktop) {
        const dx = mouseRef.current.x - CENTER;
        const dy = mouseRef.current.y - CENTER;
        return ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
      }
      return 0;
    }

    function drawRingAndCardinals(heading: number, isNavigate: boolean) {
      if (!ctx) return;

      // Outer ring
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, RING_R, 0, Math.PI * 2);
      ctx.strokeStyle = isNavigate ? colors.gold25 : colors.gold30;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Tick marks and cardinal labels
      const cardinals = ["N", "E", "S", "W"];
      for (let deg = 0; deg < 360; deg += 10) {
        const rad = ((deg - heading) * Math.PI) / 180 - Math.PI / 2;
        const isMajor = deg % 90 === 0;
        const len = isMajor ? 16 : 10;
        const x1 = CENTER + Math.cos(rad) * (RING_R - len);
        const y1 = CENTER + Math.sin(rad) * (RING_R - len);
        const x2 = CENTER + Math.cos(rad) * RING_R;
        const y2 = CENTER + Math.sin(rad) * RING_R;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isMajor
          ? (isNavigate ? colors.gold50 : colors.gold55)
          : (isNavigate ? colors.gold20 : colors.gold25);
        ctx.lineWidth = isMajor ? 1.5 : 1;
        ctx.stroke();

        if (isMajor) {
          const lx = CENTER + Math.cos(rad) * (RING_R - 30);
          const ly = CENTER + Math.sin(rad) * (RING_R - 30);
          ctx.font = `italic 14px ${fontFamily}`;
          ctx.fillStyle = isNavigate ? colors.gold45 : colors.gold55;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(cardinals[deg / 90]!, lx, ly);
        }
      }
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);

      const p = propsRef.current;
      const heading = getHeading();
      const isNavigate = p.mode === "navigate";

      drawRingAndCardinals(heading, isNavigate);

      if (p.mode === "navigate") {
        // ── Bearing arrow ───────────────────────────────────────────────
        if (p.lat != null && p.lng != null && p.targetLat != null && p.targetLng != null) {
          const bearing = bearingTo(p.lat, p.lng, p.targetLat, p.targetLng);
          const arrowAngle = ((bearing - heading) * Math.PI) / 180 - Math.PI / 2;
          const arrowLen = RING_R - 60;
          const ex = CENTER + Math.cos(arrowAngle) * arrowLen;
          const ey = CENTER + Math.sin(arrowAngle) * arrowLen;
          const headLen = 25;
          const headAngle = 0.4;

          ctx.beginPath();
          ctx.moveTo(CENTER, CENTER);
          ctx.lineTo(ex, ey);
          ctx.strokeStyle = colors.gold70;
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - headLen * Math.cos(arrowAngle - headAngle), ey - headLen * Math.sin(arrowAngle - headAngle));
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - headLen * Math.cos(arrowAngle + headAngle), ey - headLen * Math.sin(arrowAngle + headAngle));
          ctx.strokeStyle = colors.gold70;
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Centre marker outline
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = colors.gold50;
        ctx.lineWidth = 1;
        ctx.strokeRect(CENTER - 15, CENTER - 20, 30, 40);
        ctx.globalAlpha = 1;

        // Report frame data (distance computed once per frame)
        const dist =
          p.lat != null && p.lng != null && p.targetLat != null && p.targetLng != null
            ? haversineDistance(p.lat, p.lng, p.targetLat, p.targetLng)
            : null;
        p.onFrame?.({ heading, distance: dist });

      } else {
        // ── Fixed needle + alignment logic ──────────────────────────────
        const target = p.target;
        const tolerance = p.tolerance ?? 8;
        const minRotation = p.minRotation ?? 45;
        const holdSeconds = p.holdSeconds ?? 1.5;

        const signedDist = signedAngularDistance(heading, target);
        maxCWRef.current = Math.max(maxCWRef.current, signedDist);
        maxCCWRef.current = Math.min(maxCCWRef.current, signedDist);

        const angDist = angularDistance(heading, target);
        const proximity = clamp(1 - angDist / 90, 0, 1);
        const isOnTarget = angDist <= tolerance;
        const hasRotatedEnough =
          maxCWRef.current >= minRotation && maxCCWRef.current <= -minRotation;

        let holdProgress = 0;
        if (isOnTarget && hasRotatedEnough) {
          if (holdStartRef.current === null) {
            holdStartRef.current = performance.now();
          } else {
            const held = (performance.now() - holdStartRef.current) / 1000;
            holdProgress = clamp(held / holdSeconds, 0, 1);
            if (held >= holdSeconds && !solvedRef.current) {
              solvedRef.current = true;
              p.onSolved?.();
              return; // stop loop — parent will unmount on phase change
            }
          }
        } else {
          holdStartRef.current = null;
        }

        // Ramping shake during hold
        const now = performance.now() / 1000;
        const shakeFreq = 8 + holdProgress * 16;
        const shakeAmp = holdProgress * holdProgress * 1.5;
        const shakeX = Math.sin(now * shakeFreq * Math.PI * 2) * shakeAmp;
        const shakeY = Math.cos(now * shakeFreq * Math.PI * 2 * 0.7) * shakeAmp;

        // Fixed needle (always points up = current heading)
        const needleLen = RING_R - 80;
        ctx.beginPath();
        ctx.moveTo(CENTER, CENTER + 30);
        ctx.lineTo(CENTER, CENTER - needleLen);
        ctx.strokeStyle = colors.gold55;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(CENTER, CENTER - needleLen, 6, 0, Math.PI * 2);
        ctx.fillStyle = colors.gold55;
        ctx.fill();

        p.onFrame?.({ heading, proximity, isOnTarget, hasRotatedEnough, holdProgress, shakeX, shakeY });
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
    // All props and orientation are read from refs (propsRef, orientationRef).
    // Only restart the loop when geometry or device type changes.
  }, [CENTER, RING_R, size, isDesktop]);

  const cssSize =
    props.mode === "navigate" ? "min(80%, 400px)" : "min(85%, 420px)";

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: cssSize, height: cssSize }}
    />
  );
}

export const showcase: ShowcaseDefinition<CompassRoseProps> = {
  category: "game",
  label: "Compass Rose",
  description: "Canvas compass — navigate mode shows GPS bearing arrow; align mode shows fixed needle with proximity/hold feedback",
  defaults: {
    mode: "navigate",
  },
};
