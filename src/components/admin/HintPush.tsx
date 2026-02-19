"use client";

import { useState } from "react";
import {
  chaptersConfig,
  getOrderedFlow,
  type HintItem,
} from "@/config/chapters";

export default function HintPush({
  track,
  chapterId,
  flowIndex,
  revealedTiers,
}: {
  track: "test" | "live";
  chapterId: string;
  flowIndex: number;
  revealedTiers: number[];
}) {
  const [pushing, setPushing] = useState(false);
  const [lastPushed, setLastPushed] = useState<string | null>(null);
  const [error, setError] = useState("");

  const chapter = chaptersConfig.chapters[chapterId];
  if (!chapter) return null;

  const orderedFlow = getOrderedFlow(chapter);
  const step = orderedFlow[flowIndex];
  if (!step || step.type !== "website") return null;

  const config = step.config as { hints?: HintItem[] };
  if (!config.hints || config.hints.length === 0) return null;

  const nextTier = config.hints.find(
    (h) => !revealedTiers.includes(h.tier)
  );

  async function handlePush() {
    if (!nextTier || pushing) return;
    setPushing(true);
    setError("");

    try {
      const res = await fetch("/api/admin/hint/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          chapterId,
          flowIndex,
          hintTier: nextTier.tier,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Push failed.");
      } else {
        setLastPushed(`Tier ${nextTier.tier}: ${data.hint}`);
      }
    } catch {
      setError("Network error.");
    } finally {
      setPushing(false);
    }
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "12px 16px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "#6b7280",
          marginBottom: "8px",
        }}
      >
        Hints — {revealedTiers.length}/{config.hints.length} revealed
      </div>

      {nextTier ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ flex: 1, fontSize: "13px", color: "#374151" }}>
            Next: Tier {nextTier.tier}
          </div>
          <button
            onClick={handlePush}
            disabled={pushing}
            style={{
              height: "28px",
              padding: "0 12px",
              background: pushing ? "#fbbf24" : "#f59e0b",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: pushing ? "not-allowed" : "pointer",
            }}
          >
            {pushing ? "..." : "PUSH HINT"}
          </button>
        </div>
      ) : (
        <div style={{ fontSize: "13px", color: "#9ca3af" }}>
          All hints revealed.
        </div>
      )}

      {lastPushed && (
        <div
          style={{
            fontSize: "12px",
            color: "#16a34a",
            marginTop: "6px",
          }}
        >
          {lastPushed}
        </div>
      )}

      {error && (
        <div
          style={{
            fontSize: "12px",
            color: "#dc2626",
            marginTop: "6px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
