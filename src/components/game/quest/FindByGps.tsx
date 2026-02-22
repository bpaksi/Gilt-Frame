"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useDeviceOrientation } from "@/lib/hooks/useDeviceOrientation";
import { thematicDistanceText } from "@/lib/geo";
import HintSystem from "../HintSystem";
import CompassRose from "../CompassRose";
import TapToContinue from "../TapToContinue";
import GhostButton from "@/components/ui/GhostButton";
import type { FindByGpsConfig } from "@/config";
import type { ShowcaseDefinition } from "@/components/showcase";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { NavigateFrameData } from "../CompassRose";

interface FindByGpsProps {
  config: FindByGpsConfig;
  onAdvance: () => void;
  revealedHintTiers?: number[];
  onHintReveal?: (tier: number) => Promise<void>;
}

export default function FindByGps({
  config,
  onAdvance,
  revealedHintTiers,
  onHintReveal,
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

  // On desktop, no gesture is needed to start geolocation or listen for orientation events.
  // Auto-bypass the permission gate so the compass is immediately visible in the gallery.
  const { requestPermission: requestGeo } = geo;
  const { requestPermission: requestOrientation } = orientation;
  useEffect(() => {
    if (!("ontouchstart" in window)) {
      if (hasCoords) requestGeo();
      requestOrientation().catch(() => {});
      setNeedsPermission(false);
    }
  }, [hasCoords, requestGeo, requestOrientation]); // stable callbacks — effectively runs once

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
          <TapToContinue
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

        {config.hints && (
          <HintSystem
            hints={config.hints}
            initialRevealedTiers={revealedHintTiers}
            onHintReveal={onHintReveal}
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
      <TapToContinue
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
  uses: ["HintSystem", "CompassRose", "TapToContinue", "GhostButton"],
  defaults: {
    config: {
      // Coordinates present so the gallery opens in compass phase (full mode).
      // Remove them to preview lite mode (marker only).
      target_lat: 40.7589,
      target_lng: -73.9851,
      wayfinding_text: "Follow the needle to where the old paths cross.",
      geofence_radius: 30,
      instruction: "Tap the marker when you have found it.",
      title_lines: ["You have arrived.", "Something stirs nearby."],
      hints: [
        { tier: 1, text: "Stand with your back to the entrance and walk north." },
        { tier: 2, text: "Look for the iron gate at the end of the stone path." },
      ],
    },
    onAdvance: () => {},
  },
};
