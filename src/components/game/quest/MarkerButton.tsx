"use client";

import { useState, useEffect } from "react";
import MarkerSVG from "../MarkerSVG";
import type { MarkerButtonConfig } from "@/config/chapters";

interface MarkerButtonProps {
  config: MarkerButtonConfig;
  onAdvance: () => void;
}

export default function MarkerButton({ config, onAdvance }: MarkerButtonProps) {
  const [markerVisible, setMarkerVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [tapReady, setTapReady] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setMarkerVisible(true), 1200);
    const t2 = setTimeout(() => setTextVisible(true), 2800);
    const t3 = setTimeout(() => setTapReady(true), 3200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleTap = () => {
    if (!tapReady) return;
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
            animation: markerVisible ? "pulse-soft 2s ease-in-out infinite" : undefined,
          }}
        >
          <MarkerSVG size={120} variant="gold" />
        </div>

        <p
          style={{
            opacity: 0,
            animation: textVisible
              ? "pulse-soft 3s ease-in-out infinite"
              : undefined,
            color: "rgba(200, 165, 75, 0.7)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "16px",
            fontStyle: "italic",
            textAlign: "center",
            letterSpacing: "1px",
            lineHeight: 1.8,
            maxWidth: "280px",
            ...(textVisible && { opacity: undefined }),
          }}
        >
          {config.marker_text}
        </p>
      </button>
    </div>
  );
}
