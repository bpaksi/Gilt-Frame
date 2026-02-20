"use client";

import { useState, useEffect, useRef } from "react";
import MarkerSVG from "../MarkerSVG";
import type { MarkerButtonConfig } from "@/config";

interface MarkerButtonProps {
  config: MarkerButtonConfig;
  onAdvance: () => void;
}

export default function MarkerButton({ config, onAdvance }: MarkerButtonProps) {
  const { title_lines } = config;
  const [markerVisible, setMarkerVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [tapReady, setTapReady] = useState(false);
  const [lineVisibility, setLineVisibility] = useState<boolean[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const hasTitle = title_lines && title_lines.length > 0;

  useEffect(() => {
    const timers = timersRef.current;

    if (hasTitle) {
      // Stagger title lines first, then show marker
      title_lines.forEach((_, i) => {
        const t = setTimeout(() => {
          setLineVisibility((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, i * 500 + 400);
        timers.push(t);
      });

      const lastLineDelay = (title_lines.length - 1) * 500 + 400 + 800;
      const markerDelay = lastLineDelay + 1500;
      const t2 = setTimeout(() => setMarkerVisible(true), markerDelay);
      const t3 = setTimeout(() => setTextVisible(true), markerDelay + 1200);
      const t4 = setTimeout(() => setTapReady(true), markerDelay + 1600);
      timers.push(t2, t3, t4);
    } else {
      // No title — original timing
      const t1 = setTimeout(() => setMarkerVisible(true), 1200);
      const t2 = setTimeout(() => setTextVisible(true), 2800);
      const t3 = setTimeout(() => setTapReady(true), 3200);
      timers.push(t1, t2, t3);
    }

    return () => timers.forEach(clearTimeout);
  }, [hasTitle, title_lines]);

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
                color: "rgba(200, 165, 75, 0.85)",
                fontFamily: "Georgia, 'Times New Roman', serif",
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
          minWidth: "44px",
          minHeight: "44px",
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
            color: "rgba(200, 165, 75, 0.7)",
            fontFamily: "Georgia, 'Times New Roman', serif",
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
