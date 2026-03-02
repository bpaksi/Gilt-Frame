"use client";

import { useRef, useState, useCallback } from "react";
import { useDeviceOrientation } from "@/lib/hooks/useDeviceOrientation";
import TapToContinue from "../ui/TapToContinue";
import CompassRose from "../ui/CompassRose";
import CompletionCountdown from "../ui/CompletionCountdown";
import MarkerSVG from "@/components/ui/MarkerSVG";
import { colors, colorBases, fontFamily } from "@/components/ui/tokens";
import type { BearingPuzzleConfig } from "@/config";
import type { ShowcaseDefinition } from "@/components/showcase";
import type { AlignFrameData } from "../ui/CompassRose";

interface AlignBearingProps {
  config: BearingPuzzleConfig;
  onAdvance: () => void;
}

export default function AlignBearing({ config, onAdvance }: AlignBearingProps) {
  const markerRef = useRef<HTMLDivElement>(null);
  const statusTextRef = useRef<HTMLDivElement>(null);
  const orientation = useDeviceOrientation();
  const [needsPermission, setNeedsPermission] = useState(true);
  const [phase, setPhase] = useState<"compass" | "locking">("compass");

  const [permissionDenied, setPermissionDenied] = useState(false);

  const handlePermission = useCallback(async () => {
    setPermissionDenied(false);
    const ok = await orientation.requestPermission();
    if (!ok) {
      setPermissionDenied(true);
      return;
    }
    setNeedsPermission(false);
  }, [orientation]);

  // Drive DOM refs from CompassRose frame data — no React re-renders in the hot path
  const handleFrame = useCallback(
    ({ proximity, isOnTarget, hasRotatedEnough, holdProgress, shakeX, shakeY }: AlignFrameData) => {
      const markerEl = markerRef.current;
      const textEl = statusTextRef.current;

      if (markerEl) {
        const glowBlur = proximity > 0.3 ? 15 + proximity * 50 + holdProgress * 60 : 0;
        const glowColor = isOnTarget
          ? `rgba(${colorBases.goldBright}, ${0.4 + holdProgress * 0.4})`
          : `rgba(${colorBases.gold}, ${proximity * 0.3})`;
        markerEl.style.opacity = String(0.1 + proximity * 0.9);
        markerEl.style.filter = glowBlur > 0 ? `drop-shadow(0 0 ${glowBlur}px ${glowColor})` : "none";
        markerEl.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
      }
      if (textEl) {
        if (isOnTarget && hasRotatedEnough) {
          textEl.textContent = config.hold_label ?? "hold...";
          textEl.style.opacity = "0.8";
          textEl.style.color = colors.goldBright90;
          textEl.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        } else if (hasRotatedEnough) {
          textEl.textContent = config.approach_label ?? "closer...";
          textEl.style.opacity = String(0.3 + proximity * 0.5);
          textEl.style.color = colors.gold60;
          textEl.style.transform = "none";
        } else {
          textEl.textContent = "";
          textEl.style.opacity = "0";
        }
      }
    },
    [config.hold_label, config.approach_label],
  );

  // Phase driven by CompassRose.onComplete
  const handleSolved = useCallback(() => {
    setPhase("locking");
  }, []);


  if (phase === "locking") {
    return (
      <CompletionCountdown
        message={config.locking_message ?? "Plotting the course…"}
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
          gap: "20px",
        }}
      >
        <TapToContinue
          lines={config.permission_lines ?? [config.permission_message ?? "The compass awaits your permission."]}
          instruction={permissionDenied ? "Try Again" : (config.enable_label ?? "Enable Compass")}
          onComplete={handlePermission}
          markerDelay={config.permission_lines ? undefined : 0}
          textDelay={config.permission_lines ? undefined : 0}
          tapDelay={config.permission_lines ? undefined : 0}
        />
        {permissionDenied && (
          <p
            style={{
              color: colors.gold50,
              fontFamily: fontFamily,
              fontSize: "14px",
              fontStyle: "italic",
              textAlign: "center",
              letterSpacing: "1px",
              lineHeight: "1.6",
              maxWidth: "280px",
            }}
          >
            Permission was denied. Tap above to try again, or reload the page if the prompt doesn&apos;t appear.
          </p>
        )}
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
        onComplete={handleSolved}
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

export const showcase: ShowcaseDefinition<AlignBearingProps> = {
  category: "quest",
  label: "Align Bearing",
  description: "Device orientation puzzle — point phone at target bearing and hold steady",
  uses: ["TapToContinue", "CompassRose", "CompletionCountdown", "MarkerSVG"],
  tips: [
    "Tap the permission gate first — this mirrors the player flow.",
    "Mouse position drives heading on desktop — sweep the cursor to simulate rotating the phone.",
    "Hold the cursor near the target bearing (compass_target degrees from north) to trigger the hold timer.",
  ],
  defaults: {
    config: {
      compass_target: 180,
    },
    onAdvance: () => {},
  },
};
