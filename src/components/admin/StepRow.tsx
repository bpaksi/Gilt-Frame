"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { adminFetch } from "@/lib/admin/fetch";
import type { StepWithId } from "@/config";

export type StepState = "delivered" | "sent" | "ready" | "active" | "locked" | "scheduled";

const SWIPE_THRESHOLD = 60;
const BUTTON_WIDTH = 80;

export default function StepRow({
  step,
  stepState,
  track,
  chapterId,
  messageId,
  readOnly,
}: {
  step: StepWithId;
  stepState: StepState;
  track: "test" | "live";
  chapterId: string;
  messageId?: string;
  readOnly?: boolean;
}) {
  const [sending, setSending] = useState(false);
  const [marking, setMarking] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentState, setCurrentState] = useState<"sent" | "delivered" | null>(
    stepState === "sent" ? "sent" : stepState === "delivered" ? "delivered" : null
  );
  const [error, setError] = useState("");

  // Swipe state
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);
  const isScrolling = useRef(false);

  // Swipe hint: briefly show a nudge animation
  const [showHint, setShowHint] = useState(false);
  useEffect(() => {
    if (stepState === "active" || stepState === "ready") {
      const timer = setTimeout(() => setShowHint(true), 600);
      const hide = setTimeout(() => setShowHint(false), 2000);
      return () => { clearTimeout(timer); clearTimeout(hide); };
    }
  }, [stepState]);

  const isOffline = step.type !== "website";
  const hasCompanion =
    isOffline && "companion_message" in step.config && step.config.companion_message != null;

  const effectiveSent = currentState === "sent" || currentState === "delivered" || stepState === "sent" || stepState === "delivered";
  const effectiveDelivered = currentState === "delivered" || stepState === "delivered";

  const stateIcon = effectiveDelivered
    ? "✓"
    : currentState === "sent" || (stepState === "sent" && currentState !== "delivered")
      ? "◑"
      : stepState === "ready"
        ? "●"
        : stepState === "active"
          ? "◉"
          : stepState === "scheduled"
            ? "⏱"
            : effectiveSent
              ? "✓"
              : "○";

  const isCompleted = effectiveSent || completed;
  const isCurrent = !isCompleted && (stepState === "ready" || stepState === "active");
  const canSwipeComplete = isCurrent && !completing && !completed;

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
    if (!isOffline || sending || effectiveSent) return;
    setSending(true);
    setError("");

    try {
      const res = await adminFetch("/api/admin/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          chapterId,
          stepId: step.id,
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
    if (!isOffline || marking || !messageId) return;
    setMarking(true);
    setError("");

    try {
      const res = await adminFetch("/api/admin/mark-done", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          messageId,
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

  async function handleComplete() {
    if (completing || completed) return;
    setCompleting(true);
    setError("");

    try {
      const res = await adminFetch("/api/admin/complete-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          chapterId,
          stepId: step.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Complete failed.");
      } else {
        setCompleted(true);
        setSwiped(false);
        setSwipeOffset(0);
      }
    } catch {
      setError("Network error.");
    } finally {
      setCompleting(false);
    }
  }

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!canSwipeComplete) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
    isScrolling.current = false;
  }, [canSwipeComplete]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!canSwipeComplete || isScrolling.current) return;

    const dx = touchStartX.current - e.touches[0].clientX;
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);

    // If vertical movement dominates, let the page scroll
    if (!isDragging.current && dy > Math.abs(dx)) {
      isScrolling.current = true;
      return;
    }

    // Only track leftward swipes
    if (dx > 5) {
      isDragging.current = true;
      const offset = swiped
        ? Math.min(dx + BUTTON_WIDTH, BUTTON_WIDTH + 20)
        : Math.min(dx, BUTTON_WIDTH + 20);
      setSwipeOffset(offset);
    } else if (!swiped) {
      setSwipeOffset(0);
    }
  }, [canSwipeComplete, swiped]);

  const onTouchEnd = useCallback(() => {
    if (!canSwipeComplete || isScrolling.current) return;
    if (swipeOffset > SWIPE_THRESHOLD) {
      setSwiped(true);
      setSwipeOffset(BUTTON_WIDTH);
    } else {
      setSwiped(false);
      setSwipeOffset(0);
    }
    isDragging.current = false;
  }, [canSwipeComplete, swipeOffset]);

  const showSendButton = !readOnly && isOffline && stepState === "ready" && !effectiveSent;
  const showDoneButton = !readOnly && isOffline && !effectiveDelivered && messageId &&
    (currentState === "sent" || (stepState === "sent" && currentState !== "delivered"));

  const displayIcon = completed ? "✓" : stateIcon;
  const displayColor = completed ? "#b0b0b0" : stateColor;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid #e8e8e8",
        borderRadius: isCurrent ? "4px" : undefined,
      }}
    >
      {/* Hidden button behind the row */}
      {canSwipeComplete && (
        <button
          onClick={handleComplete}
          disabled={completing}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: `${BUTTON_WIDTH}px`,
            background: completing ? "#7a5a20" : "#b8860b",
            color: "#fff",
            border: "none",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.5px",
            cursor: completing ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {completing ? "..." : "COMPLETE"}
        </button>
      )}

      {/* Slideable row content */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: isCurrent ? "10px 16px" : "10px 0",
          opacity: isCompleted ? 0.45 : 1,
          background: isCurrent ? "#f0f5fa" : "#fff",
          margin: isCurrent ? "0 -16px" : undefined,
          transform: canSwipeComplete ? `translateX(-${swipeOffset}px)` : undefined,
          transition: isDragging.current ? "none" : "transform 0.2s ease-out",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: "16px",
            color: displayColor,
            width: "20px",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          {displayIcon}
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

        {canSwipeComplete && showHint && !swiped && swipeOffset === 0 && (
          <span
            style={{
              fontSize: "14px",
              color: "#b8860b",
              flexShrink: 0,
              opacity: 0.5,
              transition: "opacity 0.3s ease",
            }}
          >
            ‹‹
          </span>
        )}
      </div>
    </div>
  );
}
