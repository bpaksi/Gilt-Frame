"use client";

import GiltFrame from "./GiltFrame";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

export default function WaitingState() {
  return (
    <GiltFrame>
      <p
        style={{
          color: colors.gold50,
          fontFamily,
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

export const showcase: ShowcaseDefinition = {
  category: "game",
  label: "Waiting State",
  description: "Full-page waiting screen with marker animation",
  uses: ["GiltFrame"],
};
