"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useDeviceOrientation } from "@/lib/hooks/useDeviceOrientation";
import { haversineDistance, bearingTo, thematicDistanceText } from "@/lib/geo";
import HintSystem from "./HintSystem";
import CompassPermission from "./CompassPermission";
import IndoorWayfinding from "./IndoorWayfinding";
import type { WayfindingCompassConfig, HintItem } from "@/config/chapters";

interface WayfindingCompassProps {
  config: WayfindingCompassConfig;
  onAdvance: () => void;
  chapterId?: string;
  flowIndex?: number;
  revealedHintTiers?: number[];
}

const SIZE = 560;
const CENTER = SIZE / 2;
const RING_R = 230;

export default function WayfindingCompass({
  config,
  onAdvance,
  chapterId,
  flowIndex,
  revealedHintTiers,
}: WayfindingCompassProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const geo = useGeolocation();
  const orientation = useDeviceOrientation();
  const [needsPermission, setNeedsPermission] = useState(true);
  const [distanceText, setDistanceText] = useState("");
  const [showArrived, setShowArrived] = useState(false);
  const rafRef = useRef<number>(0);

  // Desktop simulation: use mouse for heading
  const mouseRef = useRef<{ x: number; y: number }>({ x: CENTER, y: CENTER });
  const isDesktop = typeof window !== "undefined" && !("ontouchstart" in window);

  const isOutdoor = config.target_lat !== undefined && config.target_lng !== undefined;

  const handlePermission = useCallback(async () => {
    if (isOutdoor) {
      geo.requestPermission();
    }
    await orientation.requestPermission();
    setNeedsPermission(false);
  }, [isOutdoor, geo, orientation]);

  // Canvas drawing loop for outdoor mode
  useEffect(() => {
    if (needsPermission || !isOutdoor) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Compass ring
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, RING_R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(201, 168, 76, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Heading
      let heading = orientation.heading ?? 0;
      if (isDesktop) {
        const dx = mouseRef.current.x - CENTER;
        const dy = mouseRef.current.y - CENTER;
        heading = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
      }

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
          ? "rgba(201, 168, 76, 0.5)"
          : "rgba(201, 168, 76, 0.2)";
        ctx.lineWidth = isMajor ? 1.5 : 1;
        ctx.stroke();

        if (isMajor) {
          const label = cardinals[deg / 90];
          const lx = CENTER + Math.cos(rad) * (RING_R - 30);
          const ly = CENTER + Math.sin(rad) * (RING_R - 30);
          ctx.font = "italic 14px Georgia, serif";
          ctx.fillStyle = "rgba(201, 168, 76, 0.45)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, lx, ly);
        }
      }

      // Arrow pointing to target
      if (
        geo.lat !== null &&
        geo.lng !== null &&
        config.target_lat !== undefined &&
        config.target_lng !== undefined
      ) {
        const bearing = bearingTo(
          geo.lat,
          geo.lng,
          config.target_lat,
          config.target_lng
        );
        const arrowAngle = ((bearing - heading) * Math.PI) / 180 - Math.PI / 2;
        const arrowLen = RING_R - 60;

        // Shaft
        const sx = CENTER;
        const sy = CENTER;
        const ex = CENTER + Math.cos(arrowAngle) * arrowLen;
        const ey = CENTER + Math.sin(arrowAngle) * arrowLen;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = "rgba(201, 168, 76, 0.7)";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Arrowhead
        const headLen = 25;
        const headAngle = 0.4;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(
          ex - headLen * Math.cos(arrowAngle - headAngle),
          ey - headLen * Math.sin(arrowAngle - headAngle)
        );
        ctx.moveTo(ex, ey);
        ctx.lineTo(
          ex - headLen * Math.cos(arrowAngle + headAngle),
          ey - headLen * Math.sin(arrowAngle + headAngle)
        );
        ctx.strokeStyle = "rgba(201, 168, 76, 0.7)";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Distance
        const dist = haversineDistance(
          geo.lat,
          geo.lng,
          config.target_lat,
          config.target_lng
        );
        setDistanceText(thematicDistanceText(dist));

        // Check geofence
        if (config.geofence_radius && dist < config.geofence_radius) {
          onAdvance();
        }

        // Show arrived button if no geofence and close
        if (!config.geofence_radius && dist < 50) {
          setShowArrived(true);
        }
      }

      // Center marker outline
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = "rgba(201, 168, 76, 0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(CENTER - 15, CENTER - 20, 30, 40);
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [
    needsPermission,
    isOutdoor,
    geo.lat,
    geo.lng,
    orientation.heading,
    config.target_lat,
    config.target_lng,
    config.geofence_radius,
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

  // Indoor mode
  if (!isOutdoor) {
    return (
      <IndoorWayfinding
        config={config}
        onAdvance={onAdvance}
        chapterId={chapterId}
        flowIndex={flowIndex}
        revealedHintTiers={revealedHintTiers}
      />
    );
  }

  // Permission prompt
  if (needsPermission) {
    return (
      <CompassPermission
        onPermission={handlePermission}
        label="Enable Location"
        showMarker
      />
    );
  }

  // Outdoor compass view
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        flex: 1,
        gap: "24px",
        padding: "20px",
      }}
    >
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        style={{ width: "min(80vw, 400px)", height: "min(80vw, 400px)" }}
      />

      {distanceText && (
        <p
          style={{
            color: "rgba(200, 165, 75, 0.6)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "15px",
            fontStyle: "italic",
            textAlign: "center",
            letterSpacing: "1px",
          }}
        >
          {distanceText}
        </p>
      )}

      {showArrived && (
        <button
          onClick={onAdvance}
          style={{
            background: "none",
            border: "1px solid rgba(200, 165, 75, 0.3)",
            color: "rgba(200, 165, 75, 0.7)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "15px",
            fontStyle: "italic",
            letterSpacing: "2px",
            padding: "14px 28px",
            cursor: "pointer",
            minHeight: "44px",
            WebkitTapHighlightColor: "transparent",
            opacity: 0,
            animation: "fade-in 0.8s ease forwards",
          }}
        >
          I have arrived
        </button>
      )}

      {config.hints && chapterId && flowIndex !== undefined && (
        <HintSystem
          hints={config.hints as HintItem[]}
          chapterId={chapterId}
          flowIndex={flowIndex}
          initialRevealedTiers={revealedHintTiers}
        />
      )}
    </div>
  );
}
