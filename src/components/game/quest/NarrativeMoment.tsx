"use client";

import { useState, useEffect, useRef } from "react";
import TextReveal from "./TextReveal";
import type { NarrativeMomentConfig } from "@/config/chapters";

interface NarrativeMomentProps {
  config: NarrativeMomentConfig;
  onAdvance: () => void;
}

export default function NarrativeMoment({ config, onAdvance }: NarrativeMomentProps) {
  const { lines, instruction, action_label } = config;
  const [showInstruction, setShowInstruction] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    const lastLineDelay = (lines.length - 1) * 500 + 800; // 500ms between lines per POC + 800ms fade

    if (instruction) {
      const t1 = setTimeout(() => setShowInstruction(true), lastLineDelay + 2000);
      timers.push(t1);

      if (action_label) {
        const t2 = setTimeout(() => setShowAction(true), lastLineDelay + 4000);
        timers.push(t2);
      }
    } else if (action_label) {
      const t2 = setTimeout(() => setShowAction(true), lastLineDelay + 4500);
      timers.push(t2);
    } else {
      // Auto-advance 3s after last line
      const t3 = setTimeout(onAdvance, lastLineDelay + 3000);
      timers.push(t3);
    }

    return () => timers.forEach(clearTimeout);
  }, [lines.length, instruction, action_label, onAdvance]);

  const handleAction = () => {
    // On iOS, re-request DeviceOrientation permission from user gesture
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      "requestPermission" in DeviceOrientationEvent
    ) {
      (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
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
      <TextReveal lines={lines} delayBetween={500} />

      {instruction && (
        <p
          style={{
            opacity: showInstruction ? 1 : 0,
            transition: "opacity 0.8s ease",
            color: "rgba(200, 165, 75, 0.6)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "15px",
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.8,
            maxWidth: "300px",
          }}
        >
          {instruction}
        </p>
      )}

      {action_label && (
        <button
          onClick={handleAction}
          style={{
            opacity: showAction ? 1 : 0,
            transition: "opacity 0.8s ease",
            background: "none",
            border: "1px solid rgba(200, 165, 75, 0.3)",
            color: "rgba(200, 165, 75, 0.8)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "16px",
            fontStyle: "italic",
            letterSpacing: "2px",
            padding: "14px 32px",
            cursor: showAction ? "pointer" : "default",
            minHeight: "44px",
            minWidth: "44px",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {action_label}
        </button>
      )}
    </div>
  );
}
