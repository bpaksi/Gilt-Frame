"use client";

import GiltFrame from "./GiltFrame";

export default function WaitingState() {
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
        {"The Order will contact you\nwhen ready."}
      </p>
    </GiltFrame>
  );
}
