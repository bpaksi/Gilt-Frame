"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/fetch";
import type { Step } from "@/config";
import type { MessageProgressRow } from "@/lib/admin/actions";
import HintPush from "./HintPush";

type Props = {
  step: Step;
  track: "test" | "live";
  chapterId: string;
  stepIndex: number;
  messageProgress: MessageProgressRow | null;
  revealedTiers: number[];
};

export default function CurrentStepAction({
  step,
  track,
  chapterId,
  stepIndex,
  messageProgress,
  revealedTiers,
}: Props) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const isLetter = step.type === "letter";
  const hasProgressKey = step.type !== "website";

  const alreadySent =
    messageProgress?.status === "sent" ||
    messageProgress?.status === "delivered";
  const alreadyDelivered = messageProgress?.status === "delivered";

  async function handleAction() {
    if (!hasProgressKey || sending || done) return;
    setSending(true);
    setError("");

    try {
      // Send the message
      const sendRes = await adminFetch("/api/admin/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          chapterId,
          progressKey: (step as { config: { progress_key: string } }).config.progress_key,
        }),
      });

      const sendData = await sendRes.json();
      if (!sendRes.ok) {
        setError(sendData.error ?? "Send failed.");
        return;
      }

      // For letters, also mark as done (received = delivered)
      if (isLetter) {
        const doneRes = await adminFetch("/api/admin/mark-done", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            track,
            chapterId,
            progressKey: (step as { config: { progress_key: string } }).config.progress_key,
          }),
        });

        const doneData = await doneRes.json();
        if (!doneRes.ok) {
          setError(doneData.error ?? "Mark done failed.");
          return;
        }
      }

      setDone(true);
      setTimeout(() => router.refresh(), 1200);
    } catch {
      setError("Network error.");
    } finally {
      setSending(false);
    }
  }

  // Render the body preview for the step
  function renderDetails() {
    switch (step.type) {
      case "sms":
      case "mms":
        return (
          <>
            <Detail label="To" value={step.config.to} />
            <Detail label="Body" value={step.config.body} multiline />
            {step.config._trigger_note && (
              <Detail label="Trigger" value={step.config._trigger_note} />
            )}
          </>
        );
      case "email":
        return (
          <>
            <Detail label="To" value={step.config.to} />
            <Detail label="Subject" value={step.config.subject} />
            {step.config._trigger_note && (
              <Detail label="Trigger" value={step.config._trigger_note} />
            )}
          </>
        );
      case "letter":
        return (
          <>
            <Detail label="To" value={step.config.to} />
            {step.config._trigger_note && (
              <Detail label="Trigger" value={step.config._trigger_note} />
            )}
            {step.config._content_notes && (
              <Detail label="Notes" value={step.config._content_notes} />
            )}
          </>
        );
      case "website":
        return (
          <>
            <Detail label="Component" value={step.component} />
            <Detail label="Advance" value={step.advance} />
          </>
        );
    }
  }

  // Website steps: waiting for player
  if (step.type === "website") {
    return (
      <div style={cardStyle}>
        <StepHeader name={step.name} type={step.type} />
        {renderDetails()}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "12px",
            padding: "10px 12px",
            background: "#fff8e1",
            borderRadius: "6px",
            border: "1px solid #ffe0b2",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#e68a00",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <span style={{ fontSize: "13px", color: "#e65100", fontWeight: 500 }}>
            Waiting for player...
          </span>
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
        <div style={{ marginTop: "12px" }}>
          <HintPush
            track={track}
            chapterId={chapterId}
            stepIndex={stepIndex}
            revealedTiers={revealedTiers}
          />
        </div>
      </div>
    );
  }

  // Offline steps: show action button
  const actionLabel = isLetter ? "RECEIVED" : "SEND NOW";
  const actionColor = isLetter ? "#2e7d32" : "#336699";
  const actionColorDisabled = isLetter ? "#6d9b6f" : "#5a8ab5";

  return (
    <div style={cardStyle}>
      <StepHeader name={step.name} type={step.type} />
      {renderDetails()}

      {alreadyDelivered ? (
        <StatusBadge text="Delivered" color="#2e7d32" icon="\u2713" />
      ) : alreadySent ? (
        <StatusBadge text="Sent" color="#c0a060" icon="\u25D1" />
      ) : done ? (
        <StatusBadge
          text={isLetter ? "Marked received" : "Sent successfully"}
          color="#2e7d32"
          icon="\u2713"
        />
      ) : (
        <div style={{ marginTop: "12px" }}>
          <button
            onClick={handleAction}
            disabled={sending}
            style={{
              height: "36px",
              padding: "0 24px",
              background: sending ? actionColorDisabled : actionColor,
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              cursor: sending ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              width: "100%",
            }}
          >
            {sending ? "Processing..." : actionLabel}
          </button>
        </div>
      )}

      {error && (
        <div style={{ fontSize: "12px", color: "#c62828", marginTop: "8px" }}>
          {error}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepHeader({ name, type }: { name: string; type: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "10px",
      }}
    >
      <span style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a" }}>
        {name}
      </span>
      <span
        style={{
          fontSize: "10px",
          color: "#999999",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {type}
      </span>
    </div>
  );
}

function Detail({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        fontSize: "12px",
        marginBottom: "4px",
        alignItems: multiline ? "flex-start" : "center",
      }}
    >
      <span
        style={{
          color: "#999999",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          fontSize: "10px",
          minWidth: "52px",
          paddingTop: multiline ? "2px" : undefined,
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: "#333333",
          whiteSpace: multiline ? "pre-wrap" : undefined,
          wordBreak: multiline ? "break-word" : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function StatusBadge({
  text,
  color,
  icon,
}: {
  text: string;
  color: string;
  icon: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        marginTop: "12px",
        fontSize: "13px",
        color,
        fontWeight: 500,
      }}
    >
      <span style={{ fontSize: "16px" }}>{icon}</span>
      {text}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #d0d0d0",
  borderRadius: "8px",
  padding: "14px 16px",
  marginBottom: "16px",
};
