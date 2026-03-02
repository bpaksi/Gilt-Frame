"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useDeviceOrientation } from "@/lib/hooks/useDeviceOrientation";
import { thematicDistanceText } from "@/lib/geo";
import HintSystem from "../ui/HintSystem";
import CompassRose from "../ui/CompassRose";
import TapToContinue from "../ui/TapToContinue";
import GhostButton from "@/components/ui/GhostButton";
import MultipleChoice from "./MultipleChoice";
import type { FindByGpsConfig } from "@/config";
import type { ShowcaseDefinition } from "@/components/showcase";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { NavigateFrameData } from "../ui/CompassRose";

interface FindByGpsProps {
  config: FindByGpsConfig;
  onAdvance: () => void;
  track?: "test" | "live";
  revealedHintTiers?: number[];
  onHintReveal?: (tier: number) => Promise<void>;
  onAnswerRecord?: (questionIndex: number, selectedOption: string, correct: boolean) => Promise<void>;
}

export default function FindByGps({
  config,
  onAdvance,
  track,
  revealedHintTiers,
  onHintReveal,
  onAnswerRecord,
}: FindByGpsProps) {
  const hasCoords = config.target_lat !== undefined && config.target_lng !== undefined;
  const hasQuestions = config.questions && config.questions.length > 0;
  const [phase, setPhase] = useState<"compass" | "marker" | "identification">(hasCoords ? "compass" : "marker");
  const [fadeState, setFadeState] = useState<"in" | "out">("in");

  // ── Compass phase state ────────────────────────────────────────────────────
  const geo = useGeolocation();
  const orientation = useDeviceOrientation();
  const [needsPermission, setNeedsPermission] = useState(true);
  const [distanceText, setDistanceText] = useState("");
  const [showArrived, setShowArrived] = useState(false);
  const geofenceTriggeredRef = useRef(false);

  const [debugDistanceFt, setDebugDistanceFt] = useState<number | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Auto-skip permission screen if permissions are already granted (e.g. page refresh)
  const autoCheckedRef = useRef(false);
  const geoRequestPermission = geo.requestPermission;
  const orientationRequestPermission = orientation.requestPermission;

  useEffect(() => {
    if (autoCheckedRef.current || !hasCoords) return;
    autoCheckedRef.current = true;

    navigator.permissions?.query({ name: "geolocation" }).then(async (result) => {
      if (result.state !== "granted") return;

      // Geo already granted — start watcher silently (no browser prompt)
      const geoOk = await geoRequestPermission();
      if (!geoOk) return;

      // Try orientation — succeeds silently if already granted,
      // fails on iOS if it needs a user gesture (button stays visible)
      const orientationOk = await orientationRequestPermission();
      if (!orientationOk) return;

      setNeedsPermission(false);
    }).catch(() => {});
  }, [hasCoords, geoRequestPermission, orientationRequestPermission]);

  const handlePermission = useCallback(async () => {
    setPermissionDenied(false);

    // Request in series — one system dialog at a time
    if (hasCoords) {
      const geoOk = await geo.requestPermission();
      if (!geoOk) {
        setPermissionDenied(true);
        return;
      }
    }

    const orientationOk = await orientation.requestPermission();
    if (!orientationOk) {
      setPermissionDenied(true);
      return;
    }

    setNeedsPermission(false);
  }, [hasCoords, geo, orientation]);

  // Called each frame by CompassRose — drives distance text, geofence, arrived button
  const handleFrame = useCallback(
    ({ distance }: NavigateFrameData) => {
      if (distance === null) return;
      setDistanceText(thematicDistanceText(distance, config.distance_gates));
      if (track === "test") setDebugDistanceFt(Math.round(distance * 3.28084));
      if (config.geofence_radius && distance < config.geofence_radius && !geofenceTriggeredRef.current) {
        geofenceTriggeredRef.current = true;
        setShowArrived(true);
      }
      if (!config.geofence_radius && distance < 50) {
        setShowArrived(true);
      }
    },
    [config.geofence_radius, config.distance_gates, track],
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

    if (hasQuestions) {
      fadeTo("identification");
    } else {
      onAdvance();
    }
  };

  // ── Phase transitions with fade ────────────────────────────────────────────
  const fadeTo = useCallback((target: "compass" | "marker" | "identification") => {
    setFadeState("out");
    setTimeout(() => {
      setPhase(target);
      setFadeState("in");
    }, 450);
  }, []);

  const handleRetreat = useCallback(() => {
    fadeTo("compass");
  }, [fadeTo]);

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
            gap: "20px",
          }}
        >
          <TapToContinue
            lines={config.wayfinding_text ? [config.wayfinding_text] : []}
            instruction={permissionDenied ? "Try Again" : (config.enable_label ?? "Enable Location")}
            onComplete={handlePermission}
            markerDelay={0}
            textDelay={0}
            tapDelay={0}
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
          gap: "24px",
          padding: "20px",
          opacity: fadeState === "in" ? 1 : 0,
          transition: "opacity 0.45s ease",
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

        {track === "test" && (
          <p
            style={{
              color: colors.gold40,
              fontFamily: "monospace",
              fontSize: "13px",
              textAlign: "center",
              letterSpacing: "1px",
              lineHeight: "1.6",
              margin: "-12px 0 0",
            }}
          >
            {debugDistanceFt !== null && <>{debugDistanceFt.toLocaleString()} ft<br /></>}
            {geo.lat != null ? geo.lat.toFixed(6) : "—"}, {geo.lng != null ? geo.lng.toFixed(6) : "—"}
          </p>
        )}

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
            {config.arrived_label ?? "I have arrived"}
          </GhostButton>
        )}

        {config.hints && (
          <HintSystem
            hints={config.hints}
            requestLabel="Request a Hint"
            loadingLabel="Revealing..."
            initialRevealedTiers={revealedHintTiers}
            onHintReveal={onHintReveal}
          />
        )}
      </div>
    );
  }

  // ── Render: identification phase ───────────────────────────────────────────
  if (phase === "identification" && hasQuestions) {
    return (
      <div
        style={{
          minHeight: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          opacity: fadeState === "in" ? 1 : 0,
          transition: "opacity 0.45s ease",
        }}
      >
        <MultipleChoice
          config={{
            instruction: config.identification_instruction,
            questions: config.questions!,
          }}
          onAdvance={onAdvance}
          onAnswerRecord={onAnswerRecord}
          onHintReveal={onHintReveal}
          revealedHintTiers={revealedHintTiers}
        />

        {config.retreat_instruction && (
          <div style={{ display: "flex", justifyContent: "center", padding: "0 24px 40px" }}>
            <GhostButton onClick={handleRetreat}>
              {config.retreat_instruction}
            </GhostButton>
          </div>
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
  description: "GPS compass (full mode) leading to tappable marker, optional identification questions with retreat to compass. Lite mode: marker only (no coordinates).",
  uses: ["HintSystem", "CompassRose", "TapToContinue", "GhostButton", "MultipleChoice"],
  tips: [
    "1. Tap 'Enable Location', then DevTools → More tools → Sensors → Location → Other…",
    "2. Longitude: -73.9851 (keep fixed). Start far, decrease Latitude to walk toward target (40.7589):",
    "   · Lat 40.7609 → 'The Marker is far. Keep searching.'  (>200m)",
    "   · Lat 40.7600 → 'You draw closer. The Marker stirs.'  (>100m)",
    "   · Lat 40.7594 → 'The Marker grows warm. You are near.'  (>50m)",
    "   · Lat 40.7591 → 'The Marker burns bright. You have arrived.'  + geofence fires → marker phase",
    "3. Edit distance_gates in the config editor to customise thresholds and text. 'above' is in metres.",
    "Mouse position drives compass heading — move cursor around the rose.",
  ],
  defaults: {
    config: {
      target_lat: 40.7589,
      target_lng: -73.9851,
      wayfinding_text: "Follow the needle to where the old paths cross.",
      geofence_radius: 30,
      instruction: "Tap the marker when you have found it.",
      title_lines: ["You have arrived.", "Something stirs nearby."],
      hints: [
        "Stand with your back to the entrance and walk north.",
        "Look for the iron gate at the end of the stone path.",
      ],
      questions: [
        {
          question: "What is inscribed on the stone?",
          correct_answer: "Tempus fugit",
          answer_pool: ["Carpe diem", "Memento mori", "Sic transit gloria"],
          hints: ["Look at the base of the monument."],
        },
      ],
      identification_instruction: "Examine what stands before you",
      retreat_instruction: "That's not it — keep searching",
    },
    onAdvance: () => {},
  },
};
