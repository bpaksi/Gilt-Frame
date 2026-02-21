"use client";

import { useRef, useState, useCallback } from "react";
import { useDeviceOrientation } from "@/lib/hooks/useDeviceOrientation";
import MarkerTap from "../MarkerTap";
import CompassRose from "../CompassRose";
import LockingCountdown from "../LockingCountdown";
import MarkerSVG from "@/components/ui/MarkerSVG";
import { colors, colorBases, fontFamily } from "@/components/ui/tokens";
import type { BearingPuzzleConfig } from "@/config";
import type { ShowcaseDefinition } from "@/components/showcase";
import type { AlignFrameData } from "../CompassRose";

interface BearingPuzzleProps {
  config: BearingPuzzleConfig;
  onAdvance: () => void;
}

export default function BearingPuzzle({ config, onAdvance }: BearingPuzzleProps) {
  const markerRef = useRef<HTMLDivElement>(null);
  const statusTextRef = useRef<HTMLDivElement>(null);
  const orientation = useDeviceOrientation();
  const [needsPermission, setNeedsPermission] = useState(true);
  const [phase, setPhase] = useState<"compass" | "locking">("compass");

  const handlePermission = useCallback(async () => {
    await orientation.requestPermission();
    setNeedsPermission(false);
  }, [orientation]);

  // Drive DOM refs from CompassRose frame data — no React re-renders in the hot path
  const handleFrame = useCallback(
    ({ proximity, isOnTarget, hasRotatedEnough, holdProgress, shakeX, shakeY }: AlignFrameData) => {
      const markerEl = markerRef.current;
      const textEl = statusTextRef.current;

      if (markerEl) {
        const glowBlur = proximity > 0.3 ? 15 + proximity * 50 + holdProgress * 30 : 0;
        const glowColor = isOnTarget
          ? `rgba(${colorBases.goldBright}, ${0.4 + holdProgress * 0.4})`
          : `rgba(${colorBases.gold}, ${proximity * 0.3})`;
        markerEl.style.opacity = String(0.1 + proximity * 0.9);
        markerEl.style.filter = glowBlur > 0 ? `drop-shadow(0 0 ${glowBlur}px ${glowColor})` : "none";
        markerEl.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
      }
      if (textEl) {
        if (isOnTarget && hasRotatedEnough) {
          textEl.textContent = "hold...";
          textEl.style.opacity = "0.8";
          textEl.style.color = colors.goldBright90;
          textEl.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        } else if (hasRotatedEnough) {
          textEl.textContent = "closer...";
          textEl.style.opacity = String(0.3 + proximity * 0.5);
          textEl.style.color = colors.gold50;
          textEl.style.transform = "none";
        } else {
          textEl.textContent = "";
          textEl.style.opacity = "0";
        }
      }
    },
    [],
  );

  // Phase driven by CompassRose.onSolved
  const handleSolved = useCallback(() => {
    setPhase("locking");
  }, []);


  if (phase === "locking") {
    return (
      <LockingCountdown
        message={config.locking_message ?? "The compass yields its secret…"}
        resolution={config.resolution_message ?? "The way is found"}
        onComplete={onAdvance}
      />
    );
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
          padding: "40px 24px",
        }}
      >
        <MarkerTap
          lines={[config.permission_message ?? "The compass awaits your permission."]}
          instruction="Enable Compass"
          onTap={handlePermission}
          markerDelay={0}
          textDelay={0}
          tapDelay={0}
        />
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
            color: colors.gold55,
            fontFamily: fontFamily,
            fontSize: "17px",
            fontStyle: "italic",
            textAlign: "center",
            letterSpacing: "2px",
          }}
        >
          {config.instruction}
        </div>
      )}
      <CompassRose
        mode="align"
        target={config.compass_target}
        tolerance={config.compass_tolerance}
        minRotation={config.min_rotation}
        holdSeconds={config.hold_seconds}
        size={680}
        onSolved={handleSolved}
        onFrame={handleFrame}
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
          fontFamily: fontFamily,
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

export const showcase: ShowcaseDefinition<BearingPuzzleProps> = {
  category: "quest",
  label: "Bearing Puzzle",
  description: "Device orientation puzzle — point phone at target bearing and hold steady",
  uses: ["MarkerTap", "CompassRose", "LockingCountdown", "MarkerSVG"],
  defaults: {
    config: {
      compass_target: 180,
    },
    onAdvance: () => {},
  },
};
