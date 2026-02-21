"use client";

import { useStaggeredReveal } from "@/lib/hooks/useStaggeredReveal";
import MarkerSVG from "../MarkerSVG";
import type { MarkerButtonConfig } from "@/config";

const EMPTY_LINES: string[] = [];

interface MarkerButtonProps {
  config: MarkerButtonConfig;
  onAdvance: () => void;
}

export default function MarkerButton({ config, onAdvance }: MarkerButtonProps) {
  const { title_lines } = config;
  const hasTitle = title_lines && title_lines.length > 0;

  const { lineVisibility, markerVisible, textVisible, tapReady } = useStaggeredReveal({
    lines: hasTitle ? title_lines : EMPTY_LINES,
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
