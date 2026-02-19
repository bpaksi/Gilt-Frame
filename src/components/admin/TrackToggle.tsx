"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TrackToggle({
  initialTrack,
}: {
  initialTrack: "test" | "live";
}) {
  const router = useRouter();
  const [track, setTrack] = useState(initialTrack);
  const [switching, setSwitching] = useState(false);

  async function handleSwitch(newTrack: "test" | "live") {
    if (newTrack === track || switching) return;
    setSwitching(true);

    await fetch("/api/admin/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ track: newTrack }),
    });

    setTrack(newTrack);
    setSwitching(false);
    router.refresh();
  }

  const pillStyle = (
    side: "test" | "live",
    isActive: boolean
  ): React.CSSProperties => ({
    flex: 1,
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: isActive ? 700 : 500,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    cursor: switching ? "not-allowed" : "pointer",
    border: "none",
    background: isActive
      ? side === "live"
        ? "#dc2626"
        : "#2563eb"
      : "transparent",
    color: isActive ? "#fff" : "#6b7280",
    borderRadius: side === "test" ? "6px 0 0 6px" : "0 6px 6px 0",
    transition: "all 0.15s ease",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  });

  return (
    <div
      style={{
        display: "flex",
        width: "160px",
        height: "32px",
        borderRadius: "6px",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        background: "#f9fafb",
      }}
    >
      <button
        onClick={() => handleSwitch("test")}
        style={pillStyle("test", track === "test")}
      >
        Test
      </button>
      <button
        onClick={() => handleSwitch("live")}
        style={pillStyle("live", track === "live")}
      >
        Live
      </button>
    </div>
  );
}
