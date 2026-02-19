"use client";

import { useState, useCallback } from "react";
import MarkerAnimation from "./MarkerAnimation";
import PassphraseForm from "./PassphraseForm";

interface LandingPageProps {
  hasDeviceToken: boolean;
  isReplay?: boolean;
  onReplayEnd?: () => void;
}

export default function LandingPage({
  hasDeviceToken,
  isReplay = false,
  onReplayEnd,
}: LandingPageProps) {
  const [animationDone, setAnimationDone] = useState(false);

  const handleAnimationComplete = useCallback(() => {
    setAnimationDone(true);
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        overflow: "hidden",
        position: "relative",
        padding: "40px 24px",
      }}
    >
      {/* Ambient particles */}
      {[0, 1, 2, 3, 4].map((particleId) => (
        <div
          key={particleId}
          style={{
            position: "absolute",
            width: "2px",
            height: "2px",
            background: "#C8A54B",
            borderRadius: "50%",
            filter: "blur(0.5px)",
            opacity: animationDone ? 0.3 : 0,
            animation: animationDone
              ? `drift ${5 + particleId}s ease-in-out ${particleId * 0.8}s infinite`
              : "none",
            top: `${20 + particleId * 15}%`,
            left: `${10 + particleId * 20}%`,
          }}
        />
      ))}

      <MarkerAnimation
        onComplete={handleAnimationComplete}
        delayMs={800}
      />

      {isReplay ? (
        <div
          style={{
            marginTop: "60px",
            opacity: animationDone ? 1 : 0,
            transition: "opacity 2s ease",
          }}
        >
          <button
            onClick={onReplayEnd}
            style={{
              background: "transparent",
              border: "1px solid rgba(200, 165, 75, 0.3)",
              color: "rgba(200, 165, 75, 0.7)",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "14px",
              fontStyle: "italic",
              letterSpacing: "2px",
              padding: "12px 32px",
              cursor: "pointer",
              transition: "border-color 0.3s ease, color 0.3s ease",
              minHeight: "44px",
            }}
          >
            Return to The Journey
          </button>
        </div>
      ) : (
        <PassphraseForm visible={animationDone} hasDeviceToken={hasDeviceToken} />
      )}
    </div>
  );
}
