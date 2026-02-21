"use client";

import { useRef, useState, useCallback } from "react";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useDeviceOrientation } from "@/lib/hooks/useDeviceOrientation";
import { thematicDistanceText } from "@/lib/geo";
import HintSystem from "../HintSystem";
import CompassRose from "../CompassRose";
import MarkerTap from "../MarkerTap";
import GhostButton from "@/components/ui/GhostButton";
import { revealHint } from "@/lib/actions/quest";
import type { FindByGpsConfig } from "@/config";
import type { ShowcaseDefinition } from "@/components/showcase";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { NavigateFrameData } from "../CompassRose";

interface FindByGpsProps {
  config: FindByGpsConfig;
  onAdvance: () => void;
  chapterId?: string;
  stepIndex?: number;
  revealedHintTiers?: number[];
  revealHintAction?: (chapterId: string, stepIndex: number, tier: number) => Promise<{ hint: string } | null>;
}

export default function FindByGps({
  config,
  onAdvance,
  chapterId,
  stepIndex,
  revealedHintTiers,
  revealHintAction = revealHint,
}: FindByGpsProps) {
  const hasCoords = config.target_lat !== undefined && config.target_lng !== undefined;
  const [phase, setPhase] = useState<"compass" | "marker">(hasCoords ? "compass" : "marker");

  // ── Compass phase state ────────────────────────────────────────────────────
  const geo = useGeolocation();
  const orientation = useDeviceOrientation();
  const [needsPermission, setNeedsPermission] = useState(true);
  const [distanceText, setDistanceText] = useState("");
  const [showArrived, setShowArrived] = useState(false);
  const geofenceTriggeredRef = useRef(false);

  const handlePermission = useCallback(async () => {
    if (hasCoords) geo.requestPermission();
    await orientation.requestPermission();
    setNeedsPermission(false);
  }, [hasCoords, geo, orientation]);

  // Called each frame by CompassRose — drives distance text, geofence, arrived button
  const handleFrame = useCallback(
    ({ distance }: NavigateFrameData) => {
      if (distance === null) return;
      setDistanceText(thematicDistanceText(distance));
      if (config.geofence_radius && distance < config.geofence_radius && !geofenceTriggeredRef.current) {
        geofenceTriggeredRef.current = true;
        setPhase("marker");
      }
      if (!config.geofence_radius && distance < 50) {
        setShowArrived(true);
      }
    },
    [config.geofence_radius],
  );

  // ── Marker phase state ─────────────────────────────────────────────────────
  const { title_lines } = config;
  const hasTitle = title_lines && title_lines.length > 0;

  const handleTap = () => {
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
          <MarkerTap
            instruction="Enable Location"
            onComplete={handlePermission}
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

        <CompassRose
          mode="navigate"
          lat={geo.lat}
          lng={geo.lng}
          targetLat={config.target_lat}
          targetLng={config.target_lng}
          onFrame={handleFrame}
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
            hints={config.hints}
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
        padding: "40px 24px",
      }}
    >
      <MarkerTap
        lines={hasTitle ? title_lines : []}
        instruction={config.instruction}
        onComplete={handleTap}
        active={phase === "marker"}
      />
    </div>
  );
}

export const showcase: ShowcaseDefinition<FindByGpsProps> = {
  category: "quest",
  label: "Find by GPS",
  description: "GPS compass (full mode) leading to tappable marker, or tappable marker only (lite mode, no coordinates).",
  uses: ["HintSystem", "CompassRose", "MarkerTap", "GhostButton"],
  defaults: {
    config: {
      instruction: "Tap the marker when you have found it.",
      title_lines: ["You have arrived.", "Something stirs nearby."],
    },
    onAdvance: () => {},
  },
};
