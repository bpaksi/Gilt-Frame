"use client";

import GiltFrame from "./GiltFrame";
import type { WaitingStateConfig } from "@/config/chapters";

interface WaitingStateProps {
  config?: WaitingStateConfig;
  onAdvance?: () => void;
}

export default function WaitingState({ config }: WaitingStateProps) {
  const message = config?.message || "The Order will contact you\nwhen ready.";

  return (
    <GiltFrame>
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
    </GiltFrame>
  );
}
