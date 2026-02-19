"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/admin/fetch";
import type { Step } from "@/config/chapters";

export type StepState = "delivered" | "sent" | "ready" | "active" | "locked" | "scheduled";

export default function StepRow({
  step,
  stepState,
  track,
  chapterId,
  readOnly,
}: {
  step: Step;
  stepState: StepState;
  track: "test" | "live";
  chapterId: string;
  readOnly?: boolean;
}) {
  const [sending, setSending] = useState(false);
  const [marking, setMarking] = useState(false);
  const [currentState, setCurrentState] = useState<"sent" | "delivered" | null>(
    stepState === "sent" ? "sent" : stepState === "delivered" ? "delivered" : null
  );
  const [error, setError] = useState("");

  const isOffline = step.type !== "website";
  const hasProgressKey = "progress_key" in step;
  const hasCompanion =
    "companion_message" in step && step.companion_message !== null;

  const effectiveSent = currentState === "sent" || currentState === "delivered" || stepState === "sent" || stepState === "delivered";
  const effectiveDelivered = currentState === "delivered" || stepState === "delivered";

  const stateIcon = effectiveDelivered
    ? "\u2713"
    : currentState === "sent" || (stepState === "sent" && currentState !== "delivered")
      ? "\u25D1"
      : stepState === "ready"
        ? "\u25CF"
        : stepState === "active"
          ? "\u25C9"
          : stepState === "scheduled"
            ? "\u23F1"
            : effectiveSent
              ? "\u2713"
              : "\u25CB";

  const isCompleted = effectiveSent;
  const isCurrent = !isCompleted && (stepState === "ready" || stepState === "active");

  const stateColor = effectiveDelivered
    ? "#b0b0b0"
    : currentState === "sent" || (stepState === "sent" && currentState !== "delivered")
      ? "#c0a060"
      : stepState === "ready"
        ? "#336699"
        : stepState === "active"
          ? "#e68a00"
          : effectiveSent
            ? "#b0b0b0"
            : "#999999";

  async function handleSend() {
    if (!hasProgressKey || sending || effectiveSent) return;
    setSending(true);
    setError("");

    try {
      const res = await adminFetch("/api/admin/send", {
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
        setCurrentState("sent");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSending(false);
    }
  }

  async function handleMarkDone() {
    if (!hasProgressKey || marking) return;
    setMarking(true);
    setError("");

    try {
      const res = await adminFetch("/api/admin/mark-done", {
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
        setError(data.error ?? "Mark done failed.");
      } else {
        setCurrentState("delivered");
      }
    } catch {
      setError("Network error.");
    } finally {
      setMarking(false);
    }
  }

  const showSendButton = !readOnly && isOffline && hasProgressKey && stepState === "ready" && !effectiveSent;
  const showDoneButton = !readOnly && isOffline && hasProgressKey && !effectiveDelivered &&
    (currentState === "sent" || (stepState === "sent" && currentState !== "delivered"));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: isCurrent ? "10px 16px" : "10px 0",
        borderBottom: "1px solid #e8e8e8",
        opacity: isCompleted ? 0.45 : 1,
        background: isCurrent ? "#f0f5fa" : "transparent",
        margin: isCurrent ? "0 -16px" : undefined,
        borderRadius: isCurrent ? "4px" : undefined,
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
          <span style={{ color: isCompleted ? "#999999" : isCurrent ? "#1a1a1a" : "#333333", fontWeight: isCurrent ? 600 : 500 }}>{step.name}</span>
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

      {showSendButton && (
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

      {showDoneButton && (
        <button
          onClick={handleMarkDone}
          disabled={marking}
          style={{
            height: "28px",
            padding: "0 12px",
            background: marking ? "#6d9b6f" : "#2e7d32",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.5px",
            cursor: marking ? "not-allowed" : "pointer",
            flexShrink: 0,
          }}
        >
          {marking ? "..." : "DONE"}
        </button>
      )}
    </div>
  );
}
