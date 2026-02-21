"use client";

import MarkerSVG from "@/components/ui/MarkerSVG";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface CompassPermissionProps {
  onPermission: () => void;
  children: React.ReactNode;
}

export default function CompassPermission({
  onPermission,
  children,
}: CompassPermissionProps) {
  return (
    <button
      onClick={onPermission}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        gap: "32px",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <MarkerSVG size={120} variant="gold" animated />

      <div
        style={{
          color: colors.gold70,
          fontFamily,
          fontSize: "16px",
          fontStyle: "italic",
          textAlign: "center",
          letterSpacing: "3px",
          lineHeight: 1.8,
        }}
      >
        {children}
      </div>
    </button>
  );
}

export const showcase: ShowcaseDefinition<CompassPermissionProps> = {
  category: "game",
  label: "Compass Permission",
  description: "Permission prompt with animated marker",
  uses: ["MarkerSVG"],
  defaults: { children: "Enable Compass" },
};
