"use client";

import UppercaseLabel from "@/components/ui/UppercaseLabel";
import { colors, fontFamily } from "@/components/ui/tokens";

interface ChapterSectionProps {
  name: string;
  location: string | null;
  isCompleted: boolean;
  isActive: boolean;
}

export default function ChapterSection({
  name,
  location,
  isCompleted,
  isActive,
}: ChapterSectionProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        padding: "28px 24px 16px",
      }}
    >
      {/* Status indicator */}
      <div
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: isCompleted
            ? colors.gold60
            : isActive
              ? colors.gold30
              : colors.gold12,
          marginBottom: "4px",
          ...(isActive
            ? { animation: "pulse-soft 2s ease-in-out infinite" }
            : {}),
        }}
      />

      {/* Chapter name */}
      <UppercaseLabel
        style={{
          color: isCompleted ? colors.gold70 : colors.gold50,
          fontSize: "13px",
          letterSpacing: "3px",
          textAlign: "center",
        }}
      >
        {name}
      </UppercaseLabel>

      {/* Location + status */}
      {location && (
        <p
          style={{
            color: colors.gold35,
            fontFamily,
            fontSize: "12px",
            fontStyle: "italic",
            textAlign: "center",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {location}
        </p>
      )}
    </div>
  );
}
