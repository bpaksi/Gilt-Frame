"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useDeviceOrientation } from "@/lib/hooks/useDeviceOrientation";
import CompassPermission from "./CompassPermission";
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

export default function CompassPuzzle({ config, onAdvance }: CompassPuzzleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orientation = useDeviceOrientation();
  const [needsPermission, setNeedsPermission] = useState(true);
  const [solved, setSolved] = useState(false);
  const rafRef = useRef<number>(0);

  const totalRotationRef = useRef(0);
  const prevHeadingRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);

  const target = config.compass_target;
  const tolerance = config.compass_tolerance ?? 15;
  const minRotation = config.min_rotation ?? 90;
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

      // Track total rotation
      if (prevHeadingRef.current !== null) {
        let delta = heading - prevHeadingRef.current;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        totalRotationRef.current += Math.abs(delta);
      }
      prevHeadingRef.current = heading;

      const angDist = angularDistance(heading, target);
      const proximity = clamp(1 - angDist / 90, 0, 1);
      const isOnTarget = angDist <= tolerance;
      const hasRotatedEnough = totalRotationRef.current >= minRotation;

      // Check hold timer for solve
      if (isOnTarget && hasRotatedEnough) {
        if (holdStartRef.current === null) {
          holdStartRef.current = performance.now();
        } else {
          const held = (performance.now() - holdStartRef.current) / 1000;
          if (held >= holdSeconds) {
            setSolved(true);
            // Flash effect then advance
            setTimeout(onAdvance, 1200);
            return;
          }
        }
      } else {
        holdStartRef.current = null;
      }

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

      // Center Marker with proximity-based intensity
      const markerW = 90;
      const markerH = 118;
      const markerX = CENTER - markerW / 2;
      const markerY = CENTER - markerH / 2;

      const opacity = 0.12 + proximity * 0.88;
      const glowColor = isOnTarget
        ? "rgba(232, 204, 106, 1)"
        : "rgba(201, 168, 76, 1)";
      const strokeW = 1 + proximity * 2;

      // Glow
      if (proximity > 0.3) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15 + proximity * 50;
      }

      ctx.globalAlpha = opacity;
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = strokeW;
      ctx.strokeRect(markerX, markerY, markerW, markerH);

      // Hourglass curves inside marker
      ctx.beginPath();
      ctx.moveTo(markerX + 22, markerY + 25);
      ctx.bezierCurveTo(
        markerX + 22, markerY + 59,
        markerX + 68, markerY + 50,
        markerX + 68, markerY + 85
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(markerX + 68, markerY + 25);
      ctx.bezierCurveTo(
        markerX + 68, markerY + 59,
        markerX + 22, markerY + 50,
        markerX + 22, markerY + 85
      );
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Proximity text
      if (isOnTarget) {
        ctx.font = "italic 16px Georgia, serif";
        ctx.fillStyle = "rgba(232, 204, 106, 0.8)";
        ctx.textAlign = "center";
        ctx.fillText("hold...", CENTER, CENTER + markerH / 2 + 36);
      } else if (proximity > 0.45) {
        ctx.font = "italic 15px Georgia, serif";
        ctx.fillStyle = "rgba(201, 168, 76, 0.5)";
        ctx.textAlign = "center";
        ctx.fillText("closer...", CENTER, CENTER + markerH / 2 + 36);
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

  // Solved flash animation
  if (solved) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
          flex: 1,
          opacity: 0,
          animation: "fade-in 0.3s ease forwards",
        }}
      >
        <div
          style={{
            width: "90px",
            height: "118px",
            border: "2px solid rgba(232, 204, 106, 0.8)",
            boxShadow: "0 0 60px rgba(232, 204, 106, 0.6)",
            opacity: 0,
            animation: "fade-in 0.5s ease forwards 0.2s",
          }}
        />
      </div>
    );
  }

  // Permission prompt
  if (needsPermission) {
    return (
      <CompassPermission onPermission={handlePermission}>
        <div>The compass awaits your permission.</div>
        <div style={{ marginTop: "8px" }}>Enable Compass</div>
      </CompassPermission>
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
      }}
    >
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        style={{ width: "min(85vw, 420px)", height: "min(85vw, 420px)" }}
      />
    </div>
  );
}
