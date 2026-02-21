"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useDeviceOrientation } from "@/lib/hooks/useDeviceOrientation";
import { haversineDistance, bearingTo, thematicDistanceText } from "@/lib/geo";
import { useStaggeredReveal } from "@/lib/hooks/useStaggeredReveal";
import HintSystem from "../HintSystem";
import CompassPermission from "../CompassPermission";
import MarkerSVG from "@/components/ui/MarkerSVG";
import GhostButton from "@/components/ui/GhostButton";
import type { FindByGpsConfig, HintItem } from "@/config";
import type { ShowcaseDefinition } from "@/components/showcase";
import { colors, fontFamily, MIN_TAP_TARGET } from "@/components/ui/tokens";

interface FindByGpsProps {
  config: FindByGpsConfig;
  onAdvance: () => void;
  chapterId?: string;
  stepIndex?: number;
  revealedHintTiers?: number[];
  revealHintAction?: (chapterId: string, stepIndex: number, tier: number) => Promise<{ hint: string } | null>;
}

const SIZE = 560;
const CENTER = SIZE / 2;
const RING_R = 230;

const EMPTY_LINES: string[] = [];

export default function FindByGps({
  config,
  onAdvance,
  chapterId,
  stepIndex,
  revealedHintTiers,
  revealHintAction,
}: FindByGpsProps) {
  const hasCoords = config.target_lat !== undefined && config.target_lng !== undefined;
  const [phase, setPhase] = useState<"compass" | "marker">(hasCoords ? "compass" : "marker");

  // ── Compass phase state ────────────────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const geo = useGeolocation();
  const orientation = useDeviceOrientation();
  const [needsPermission, setNeedsPermission] = useState(true);
  const [distanceText, setDistanceText] = useState("");
  const [showArrived, setShowArrived] = useState(false);
  const rafRef = useRef<number>(0);
  const geofenceTriggeredRef = useRef(false);

  // Desktop simulation: use mouse for heading
  const mouseRef = useRef<{ x: number; y: number }>({ x: CENTER, y: CENTER });
  const isDesktop = typeof window !== "undefined" && !("ontouchstart" in window);

  const handlePermission = useCallback(async () => {
    if (hasCoords) geo.requestPermission();
    await orientation.requestPermission();
    setNeedsPermission(false);
  }, [hasCoords, geo, orientation]);

  // Canvas drawing loop (compass phase only)
  useEffect(() => {
    if (phase !== "compass" || needsPermission) return;
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
      ctx.strokeStyle = colors.gold25;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Heading: prefer real orientation, fall back to mouse on desktop
      let heading: number;
      if (orientation.heading !== null) {
        heading = orientation.heading;
      } else if (isDesktop) {
        const dx = mouseRef.current.x - CENTER;
        const dy = mouseRef.current.y - CENTER;
        heading = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
      } else {
        heading = 0;
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
          ? colors.gold50
          : colors.gold20;
        ctx.lineWidth = isMajor ? 1.5 : 1;
        ctx.stroke();

        if (isMajor) {
          const label = cardinals[deg / 90];
          const lx = CENTER + Math.cos(rad) * (RING_R - 30);
          const ly = CENTER + Math.sin(rad) * (RING_R - 30);
          ctx.font = `italic 14px ${fontFamily}`;
          ctx.fillStyle = colors.gold45;
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
        ctx.beginPath();
        ctx.moveTo(CENTER, CENTER);
        ctx.lineTo(
          CENTER + Math.cos(arrowAngle) * arrowLen,
          CENTER + Math.sin(arrowAngle) * arrowLen
        );
        ctx.strokeStyle = colors.gold70;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Arrowhead
        const ex = CENTER + Math.cos(arrowAngle) * arrowLen;
        const ey = CENTER + Math.sin(arrowAngle) * arrowLen;
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
        ctx.strokeStyle = colors.gold70;
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

        // Geofence → transition to marker phase (not onAdvance)
        if (config.geofence_radius && dist < config.geofence_radius && !geofenceTriggeredRef.current) {
          geofenceTriggeredRef.current = true;
          setPhase("marker");
        }

        // Show "I have arrived" button if no geofence and close enough
        if (!config.geofence_radius && dist < 50) {
          setShowArrived(true);
        }
      }

      // Center marker outline
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = colors.gold50;
      ctx.lineWidth = 1;
      ctx.strokeRect(CENTER - 15, CENTER - 20, 30, 40);
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [
    phase,
    needsPermission,
    geo.lat,
    geo.lng,
    orientation.heading,
    config.target_lat,
    config.target_lng,
    config.geofence_radius,
    isDesktop,
  ]);

  // Desktop mouse tracking
  useEffect(() => {
    if (!isDesktop || needsPermission || phase !== "compass") return;
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
  }, [isDesktop, needsPermission, phase]);

  // ── Marker phase state ─────────────────────────────────────────────────────
  const { title_lines } = config;
  const hasTitle = title_lines && title_lines.length > 0;

  const { lineVisibility, markerVisible, textVisible, tapReady } = useStaggeredReveal({
    lines: hasTitle ? title_lines : EMPTY_LINES,
    active: phase === "marker",
  });

  const handleTap = () => {
    if (!tapReady) return;
    // On iOS, request DeviceOrientation permission from user gesture
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      "requestPermission" in DeviceOrientationEvent
    ) {
      (
        DeviceOrientationEvent as unknown as {
          requestPermission: () => Promise<string>;
        }
      )
        .requestPermission()
        .catch(() => {});
    }
    onAdvance();
  };

  // ── Render: compass phase ──────────────────────────────────────────────────
  if (phase === "compass") {
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
            padding: "40px 24px",
          }}
        >
          <CompassPermission onPermission={handlePermission}>
            Enable Location
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
          gap: "24px",
          padding: "20px",
        }}
      >
        {config.wayfinding_text && (
          <p
            style={{
              color: colors.gold70,
              fontFamily: fontFamily,
              fontSize: "17px",
              fontStyle: "italic",
              textAlign: "center",
              letterSpacing: "1.5px",
              lineHeight: "1.6",
              maxWidth: "280px",
            }}
          >
            {config.wayfinding_text}
          </p>
        )}

        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          style={{ width: "min(80%, 400px)", height: "min(80%, 400px)" }}
        />

        {distanceText && (
          <p
            style={{
              color: colors.gold60,
              fontFamily: fontFamily,
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
          <GhostButton
            onClick={() => setPhase("marker")}
            style={{ opacity: 0, animation: "fade-in 0.8s ease forwards" }}
          >
            I have arrived
          </GhostButton>
        )}

        {config.hints && chapterId && stepIndex !== undefined && (
          <HintSystem
            hints={config.hints as HintItem[]}
            chapterId={chapterId}
            stepIndex={stepIndex}
            initialRevealedTiers={revealedHintTiers}
            revealHintAction={revealHintAction}
          />
        )}
      </div>
    );
  }

  // ── Render: marker phase ───────────────────────────────────────────────────
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
      {hasTitle && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {title_lines.map((line, i) => (
            <p
              key={i}
              style={{
                opacity: lineVisibility[i] ? 1 : 0,
                transition: "opacity 0.8s ease",
                color: colors.gold85,
                fontFamily: fontFamily,
                fontSize: "18px",
                fontStyle: "italic",
                textAlign: "center",
                lineHeight: 1.8,
                maxWidth: "320px",
                margin: 0,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      )}

      <button
        onClick={handleTap}
        disabled={!tapReady}
        style={{
          background: "none",
          border: "none",
          cursor: tapReady ? "pointer" : "default",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          padding: "20px",
          minWidth: MIN_TAP_TARGET,
          minHeight: MIN_TAP_TARGET,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <div
          style={{
            opacity: markerVisible ? 1 : 0,
            transition: "opacity 0.8s ease",
            animation: markerVisible
              ? "pulse-soft 2s ease-in-out infinite"
              : undefined,
          }}
        >
          <MarkerSVG size={120} variant="gold" />
        </div>

        <p
          style={{
            opacity: textVisible ? 1 : 0,
            transition: "opacity 0.8s ease",
            color: colors.gold70,
            fontFamily: fontFamily,
            fontSize: "16px",
            fontStyle: "italic",
            textAlign: "center",
            letterSpacing: "1px",
            lineHeight: 1.8,
            maxWidth: "280px",
          }}
        >
          {config.instruction}
        </p>
      </button>
    </div>
  );
}

export const showcase: ShowcaseDefinition<FindByGpsProps> = {
  category: "quest",
  label: "Find by GPS",
  description: "GPS compass (full mode) leading to tappable marker, or tappable marker only (lite mode, no coordinates).",
  uses: ["HintSystem", "CompassPermission", "MarkerSVG", "GhostButton"],
  defaults: {
    config: {
      instruction: "Tap the marker when you have found it.",
      title_lines: ["You have arrived.", "Something stirs nearby."],
    },
    onAdvance: () => {},
  },
};
