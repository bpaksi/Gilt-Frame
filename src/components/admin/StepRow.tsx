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

  const displayIcon = completed ? "\u2713" : stateIcon;
  const displayColor = completed ? "#b0b0b0" : stateColor;

  return (
    <div
      className={`relative overflow-hidden border-b border-admin-border-light ${
        isCurrent ? "rounded" : ""
      }`}
    >
      {/* Hidden button behind the row */}
      {canSwipeComplete && (
        <button
          onClick={handleComplete}
          disabled={completing}
          className={`absolute right-0 top-0 bottom-0 w-20 text-white border-none text-[11px] font-bold tracking-[0.5px] flex items-center justify-center transition-colors ${
            completing
              ? "bg-[#7a5a20] cursor-not-allowed"
              : "bg-admin-gold hover:bg-admin-gold-hover cursor-pointer"
          }`}
        >
          {completing ? "..." : "COMPLETE"}
        </button>
      )}

      {/* Slideable row content */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`flex items-center gap-2.5 relative z-[1] ${
          isCurrent
            ? "py-2.5 px-4 bg-blue-50 -mx-4"
            : "py-2.5 px-0 bg-admin-card"
        } ${isCompleted ? "opacity-45" : "opacity-100"}`}
        style={{
          transform: canSwipeComplete ? `translateX(-${swipeOffset}px)` : undefined,
          transition: isDragging.current ? "none" : "transform 0.2s ease-out",
        }}
      >
        <span
          className="text-base w-5 text-center shrink-0"
          style={{ color: displayColor }}
        >
          {displayIcon}
        </span>

        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium flex items-center gap-1.5 flex-wrap">
            <span className={`${isCompleted ? "text-admin-text-faint" : isCurrent ? "text-admin-text-dark font-semibold" : "text-admin-text font-medium"}`}>
              {step.name}
            </span>
            <span className="text-[10px] text-admin-text-faint uppercase tracking-[0.5px]">
              {step.type}
            </span>
            {hasCompanion && (
              <span className="text-[9px] bg-blue-50 text-admin-blue px-1.5 py-px rounded-sm font-semibold">
                +auto
              </span>
            )}
          </div>
          {error && (
            <div className="text-[11px] text-admin-red mt-0.5">
              {error}
            </div>
          )}
        </div>

        {showSendButton && (
          <button
            onClick={handleSend}
            disabled={sending}
            className={`admin-btn admin-focus h-7 px-3 text-white border-none rounded text-[11px] font-semibold tracking-[0.5px] shrink-0 transition-colors duration-150 ${
              sending
                ? "bg-admin-blue-disabled cursor-not-allowed"
                : "bg-admin-blue hover:bg-admin-blue-hover cursor-pointer"
            }`}
          >
            {sending ? "..." : "SEND"}
          </button>
        )}

        {showDoneButton && (
          <button
            onClick={handleMarkDone}
            disabled={marking}
            className={`admin-btn admin-focus h-7 px-3 text-white border-none rounded text-[11px] font-semibold tracking-[0.5px] shrink-0 transition-colors duration-150 ${
              marking
                ? "bg-admin-green-disabled cursor-not-allowed"
                : "bg-admin-green hover:brightness-110 cursor-pointer"
            }`}
          >
            {marking ? "..." : "DONE"}
          </button>
        )}

        {/* Desktop: visible COMPLETE button */}
        {canSwipeComplete && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className={`admin-btn admin-focus hidden md:inline-flex h-7 px-3 border-none rounded text-[11px] font-bold tracking-[0.5px] shrink-0 transition-colors duration-150 ${
              completing
                ? "bg-[#7a5a20] text-white/70 cursor-not-allowed"
                : "bg-admin-gold text-white hover:bg-admin-gold-hover cursor-pointer"
            }`}
          >
            {completing ? "..." : "COMPLETE"}
          </button>
        )}

        {/* Mobile: swipe hint */}
        {canSwipeComplete && showHint && !swiped && swipeOffset === 0 && (
          <span className="text-sm text-admin-gold shrink-0 opacity-50 transition-opacity duration-300 md:hidden">
            {"\u2039\u2039"}
          </span>
        )}
      </div>
    </div>
  );
}
