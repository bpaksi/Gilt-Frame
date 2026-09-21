"use client";

import SealSVG from "@/components/ui/SealSVG";
import UppercaseLabel from "@/components/ui/UppercaseLabel";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { SealConfig } from "@/config";

interface SealDividerProps {
  seal: SealConfig;
  chapterId: string;
  isEarned: boolean;
}

export default function SealDivider({ seal, chapterId, isEarned }: SealDividerProps) {
  if (!isEarned) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        padding: "32px 24px",
      }}
    >
      {/* Seal icon */}
      <div
        style={{
          position: "relative",
        }}
      >
        {/* Glow behind seal */}
        <div
          style={{
            position: "absolute",
            inset: "-12px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.gold15} 0%, transparent 70%)`,
            animation: "pulse-soft 3s ease-in-out infinite",
          }}
        />
        <SealSVG chapterId={chapterId} size={80} earned />
      </div>

      {/* Seal name */}
      <UppercaseLabel
        style={{
          color: colors.gold60,
          fontSize: "11px",
          letterSpacing: "3px",
        }}
      >
        {seal.name}
      </UppercaseLabel>

      {/* Description */}
      {seal.description && (
        <p
          style={{
            color: colors.gold40,
            fontFamily,
            fontSize: "13px",
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: "260px",
            margin: 0,
          }}
        >
          {seal.description}
        </p>
      )}
    </div>
  );
}
