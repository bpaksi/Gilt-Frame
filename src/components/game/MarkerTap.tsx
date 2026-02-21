"use client";

import { useStaggeredReveal } from "@/lib/hooks/useStaggeredReveal";
import MarkerSVG from "@/components/ui/MarkerSVG";
import { colors, fontFamily, MIN_TAP_TARGET } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface MarkerTapProps {
  /** Lines of text staggered in above the marker. Omit or pass empty array for no header. */
  lines?: string[];
  /** Instruction text displayed below the marker. Omit for no instruction. */
  instruction?: string;
  /** Called when the user taps the marker (only fires once tapReady is true). */
  onTap: () => void;
  /** Whether the stagger sequence is running. Defaults to true. */
  active?: boolean;
  /** Override delay (ms) between last line settling and marker appearing. */
  markerDelay?: number;
  /** Override delay (ms) after marker before instruction text appears. */
  textDelay?: number;
  /** Override delay (ms) after marker before tap becomes interactive. */
  tapDelay?: number;
}

/**
 * GAME component: staggered title lines → pulsing gold marker → instruction text.
 * The whole block is a tap target; calls `onTap` once the sequence has settled.
 *
 * Used by FindByGps (marker phase) and FindByText (guidance phase).
 */
export default function MarkerTap({
  lines = [],
  instruction,
  onTap,
  active = true,
  markerDelay,
  textDelay,
  tapDelay,
}: MarkerTapProps) {
  const { lineVisibility, markerVisible, textVisible, tapReady } = useStaggeredReveal({
    lines,
    active,
    markerDelay,
    textDelay,
    tapDelay,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}
    >
      {lines.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {lines.map((line, i) => (
            <p
              key={i}
              style={{
                opacity: lineVisibility[i] ? 1 : 0,
                transition: "opacity 0.8s ease",
                color: colors.gold85,
                fontFamily: fontFamily,
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
        onClick={() => { if (tapReady) onTap(); }}
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
          minWidth: MIN_TAP_TARGET,
          minHeight: MIN_TAP_TARGET,
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

        {instruction && (
          <p
            style={{
              opacity: textVisible ? 1 : 0,
              transition: "opacity 0.8s ease",
              color: colors.gold70,
              fontFamily: fontFamily,
              fontSize: "16px",
              fontStyle: "italic",
              textAlign: "center",
              letterSpacing: "1px",
              lineHeight: 1.8,
              maxWidth: "280px",
              margin: 0,
            }}
          >
            {instruction}
          </p>
        )}
      </button>
    </div>
  );
}

export const showcase: ShowcaseDefinition<MarkerTapProps> = {
  category: "game",
  label: "Marker Tap",
  description: "Canonical pause/confirmation tap target. Optional staggered header lines above marker, optional instruction text below. Replaces CompassPermission.",
  uses: ["MarkerSVG"],
  defaults: {
    lines: ["You have arrived.", "Something stirs nearby."],
    instruction: "Tap the marker when you have found it.",
    active: true,
  },
  callbacks: { onTap: "done" },
};
