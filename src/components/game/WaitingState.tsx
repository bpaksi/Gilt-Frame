"use client";

import MarkerSVG from "./MarkerSVG";
import type { WaitingStateConfig } from "@/config/chapters";

interface WaitingStateProps {
  config?: WaitingStateConfig;
  onAdvance?: () => void;
}

export default function WaitingState({ config }: WaitingStateProps) {
  const message = config?.message || "The Order will contact you\nwhen ready.";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        gap: "32px",
        padding: "40px 24px",
      }}
    >
      <div style={{ animation: "pulse-soft 2s ease-in-out infinite" }}>
        <MarkerSVG size={64} variant="gold" />
      </div>
      <p
        style={{
          color: "rgba(200, 165, 75, 0.5)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "16px",
          fontStyle: "italic",
          textAlign: "center",
          letterSpacing: "1px",
          lineHeight: "1.8",
          maxWidth: "280px",
          whiteSpace: "pre-line",
        }}
      >
        {message}
      </p>
    </div>
  );
}
