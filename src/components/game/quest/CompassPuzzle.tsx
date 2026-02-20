"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useDeviceOrientation } from "@/lib/hooks/useDeviceOrientation";
import CompassPermission from "./CompassPermission";
import MarkerSVG from "../MarkerSVG";
import type { CompassPuzzleConfig } from "@/config";

interface CompassPuzzleProps {
  config: CompassPuzzleConfig;
  onAdvance: () => void;
}

const SIZE = 680;
const CENTER = SIZE / 2;
const RING_R = 280;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function angularDistance(a: number, b: number): number {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

/** Signed angular distance from target to heading: positive = CW, negative = CCW. Range -180..+180 */
function signedAngularDistance(heading: number, target: number): number {
  let d = heading - target;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

export default function CompassPuzzle({ config, onAdvance }: CompassPuzzleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const statusTextRef = useRef<HTMLDivElement>(null);
  const orientation = useDeviceOrientation();
  const [needsPermission, setNeedsPermission] = useState(true);
  const [solved, setSolved] = useState(false);
  const rafRef = useRef<number>(0);

  const maxCWRef = useRef(0);
  const maxCCWRef = useRef(0);
  const holdStartRef = useRef<number | null>(null);

  const target = config.compass_target;
  const tolerance = config.compass_tolerance ?? 8;
  const minRotation = config.min_rotation ?? 45;
  const holdSeconds = config.hold_seconds ?? 1.5;

  // Desktop simulation
  const mouseRef = useRef<{ x: number; y: number }>({ x: CENTER, y: CENTER });
  const isDesktop = typeof window !== "undefined" && !("ontouchstart" in window);

  const handlePermission = useCallback(async () => {
    await orientation.requestPermission();
    setNeedsPermission(false);
  }, [orientation]);

  useEffect(() => {
    if (needsPermission || solved) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, SIZE, SIZE);

      let heading = orientation.heading ?? 0;
      if (isDesktop) {
        const dx = mouseRef.current.x - CENTER;
        const dy = mouseRef.current.y - CENTER;
        heading = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
      }

      // Track bidirectional sweep from target
      const signedDist = signedAngularDistance(heading, target);
      maxCWRef.current = Math.max(maxCWRef.current, signedDist);
      maxCCWRef.current = Math.min(maxCCWRef.current, signedDist);

      const angDist = angularDistance(heading, target);
      const proximity = clamp(1 - angDist / 90, 0, 1);
      const isOnTarget = angDist <= tolerance;
      const hasRotatedEnough =
        maxCWRef.current >= minRotation && maxCCWRef.current <= -minRotation;

      // Check hold timer for solve
      let holdProgress = 0;
      if (isOnTarget && hasRotatedEnough) {
        if (holdStartRef.current === null) {
          holdStartRef.current = performance.now();
        } else {
          const held = (performance.now() - holdStartRef.current) / 1000;
          holdProgress = clamp(held / holdSeconds, 0, 1);
          if (held >= holdSeconds) {
            setSolved(true);
            setTimeout(onAdvance, 300);
            return;
          }
        }
      } else {
        holdStartRef.current = null;
      }

      // Ramping shake during hold
      const now = performance.now() / 1000;
      const shakeFreq = 10 + holdProgress * 40;
      const shakeAmp = holdProgress * holdProgress * 3;
      const shakeX = Math.sin(now * shakeFreq * Math.PI * 2) * shakeAmp;
      const shakeY = Math.cos(now * shakeFreq * Math.PI * 2 * 0.7) * shakeAmp;

      // Compass ring
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, RING_R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(201, 168, 76, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Tick marks and cardinals
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
          ? "rgba(201, 168, 76, 0.55)"
          : "rgba(201, 168, 76, 0.25)";
        ctx.lineWidth = isMajor ? 1.5 : 1;
        ctx.stroke();

        if (isMajor) {
          const label = cardinals[deg / 90];
          const lx = CENTER + Math.cos(rad) * (RING_R - 30);
          const ly = CENTER + Math.sin(rad) * (RING_R - 30);
          ctx.font = "italic 14px Georgia, serif";
          ctx.fillStyle = "rgba(201, 168, 76, 0.55)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, lx, ly);
        }
      }

      // Fixed needle (points up = current heading)
      const needleLen = RING_R - 80;
      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER + 30);
      ctx.lineTo(CENTER, CENTER - needleLen);
      ctx.strokeStyle = "rgba(201, 168, 76, 0.55)";
      ctx.lineWidth = 2;
      ctx.stroke();
      // Tip dot
      ctx.beginPath();
      ctx.arc(CENTER, CENTER - needleLen, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(201, 168, 76, 0.55)";
      ctx.fill();

      // Drive DOM marker from draw loop
      const markerEl = markerRef.current;
      const textEl = statusTextRef.current;
      if (markerEl) {
        const opacity = 0.1 + proximity * 0.9;
        const glowBlur = proximity > 0.3
          ? 15 + proximity * 50 + holdProgress * 30
          : 0;
        const glowColor = isOnTarget
          ? `rgba(232, 204, 106, ${0.4 + holdProgress * 0.4})`
          : `rgba(201, 168, 76, ${proximity * 0.3})`;
        markerEl.style.opacity = String(opacity);
        markerEl.style.filter = glowBlur > 0
          ? `drop-shadow(0 0 ${glowBlur}px ${glowColor})`
          : "none";
        markerEl.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
      }
      if (textEl) {
        if (isOnTarget && hasRotatedEnough) {
          textEl.textContent = "hold...";
          textEl.style.opacity = "0.8";
          textEl.style.color = "rgba(232, 204, 106, 0.8)";
          textEl.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        } else if (hasRotatedEnough) {
          textEl.textContent = "closer...";
          textEl.style.opacity = String(0.3 + proximity * 0.5);
          textEl.style.color = "rgba(201, 168, 76, 0.5)";
          textEl.style.transform = "none";
        } else {
          textEl.textContent = "";
          textEl.style.opacity = "0";
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [
    needsPermission,
    solved,
    orientation.heading,
    target,
    tolerance,
    minRotation,
    holdSeconds,
    onAdvance,
    isDesktop,
  ]);

  // Desktop mouse tracking
  useEffect(() => {
    if (!isDesktop || needsPermission) return;
    const handleMouse = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = SIZE / rect.width;
      const scaleY = SIZE / rect.height;
      mouseRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [isDesktop, needsPermission]);

  if (solved) {
    return <div style={{ minHeight: "100%", flex: 1 }} />;
  }

  if (needsPermission) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
          flex: 1,
          gap: "32px",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            color: "rgba(200, 165, 75, 0.7)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "16px",
            fontStyle: "italic",
            textAlign: "center",
            letterSpacing: "3px",
            lineHeight: 1.8,
          }}
        >
          The compass awaits your permission.
        </div>
        <CompassPermission onPermission={handlePermission}>
          Enable Compass
        </CompassPermission>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        flex: 1,
        padding: "20px",
        gap: "24px",
      }}
    >
      {config.instruction && (
        <div
          style={{
            color: "rgba(200, 165, 75, 0.55)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "17px",
            fontStyle: "italic",
            textAlign: "center",
            letterSpacing: "2px",
          }}
        >
          {config.instruction}
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        style={{ width: "min(85vw, 420px)", height: "min(85vw, 420px)" }}
      />
      <div
        ref={markerRef}
        style={{ opacity: 0.1, willChange: "opacity, filter, transform" }}
      >
        <MarkerSVG size={56} variant="gold" />
      </div>
      <div
        ref={statusTextRef}
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "15px",
          fontStyle: "italic",
          textAlign: "center",
          letterSpacing: "2px",
          opacity: 0,
          minHeight: "1.5em",
          willChange: "opacity, color, transform",
        }}
      />
    </div>
  );
}
