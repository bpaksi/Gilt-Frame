"use client";

import { useState } from "react";
import type { FlowStep } from "@/config/chapters";

export type StepState = "sent" | "ready" | "active" | "locked" | "scheduled";

export default function FlowStepRow({
  step,
  stepState,
  track,
  chapterId,
}: {
  step: FlowStep;
  stepState: StepState;
  track: "test" | "live";
  chapterId: string;
}) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(stepState === "sent");
  const [error, setError] = useState("");

  const isOffline = step.type !== "website";
  const hasProgressKey = "progress_key" in step;
  const hasCompanion =
    "companion_message" in step && step.companion_message !== null;

  const stateIcon = sent
    ? "\u2713"
    : stepState === "ready"
      ? "\u25CF"
      : stepState === "active"
        ? "\u25C9"
        : stepState === "scheduled"
          ? "\u23F1"
          : "\u25CB";

  const stateColor = sent
    ? "#2e7d32"
    : stepState === "ready"
      ? "#336699"
      : stepState === "active"
        ? "#e68a00"
        : "#d0d0d0";

  async function handleSend() {
    if (!hasProgressKey || sending || sent) return;
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/admin/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          chapterId,
          progressKey: (step as { progress_key: string }).progress_key,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Send failed.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 0",
        borderBottom: "1px solid #e8e8e8",
        opacity: stepState === "locked" ? 0.5 : 1,
      }}
    >
      <span
        style={{
          fontSize: "16px",
          color: stateColor,
          width: "20px",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        {stateIcon}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          <span>{step.name}</span>
          <span
            style={{
              fontSize: "10px",
              color: "#999999",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {step.type}
          </span>
          {hasCompanion && (
            <span
              style={{
                fontSize: "9px",
                background: "#e8eef5",
                color: "#336699",
                padding: "1px 5px",
                borderRadius: "3px",
                fontWeight: 600,
              }}
            >
              +auto
            </span>
          )}
        </div>
        {error && (
          <div style={{ fontSize: "11px", color: "#c62828", marginTop: "2px" }}>
            {error}
          </div>
        )}
      </div>

      {isOffline && hasProgressKey && stepState === "ready" && !sent && (
        <button
          onClick={handleSend}
          disabled={sending}
          style={{
            height: "28px",
            padding: "0 12px",
            background: sending ? "#5a8ab5" : "#336699",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.5px",
            cursor: sending ? "not-allowed" : "pointer",
            flexShrink: 0,
          }}
        >
          {sending ? "..." : "SEND"}
        </button>
      )}
    </div>
  );
}
