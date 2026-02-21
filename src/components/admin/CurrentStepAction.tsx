"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/fetch";
import { COMPONENT_ADVANCE, type StepWithId } from "@/config";
import type { MessageProgressRow } from "@/lib/admin/actions";
import HintPush from "./HintPush";

type Props = {
  step: StepWithId;
  track: "test" | "live";
  chapterId: string;
  stepIndex: number;
  messageProgress: MessageProgressRow | null;
  scheduledAt: string | null;
  revealedTiers: number[];
  location: string | null;
};

export default function CurrentStepAction({
  step,
  track,
  chapterId,
  stepIndex,
  messageProgress,
  scheduledAt,
  revealedTiers,
  location,
}: Props) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [delayMornings, setDelayMornings] = useState<number | null>(null);

  const isLetter = step.type === "letter";
  const isOffline = step.type !== "website";
  const supportsDelay = step.type === "sms" || step.type === "email";

  const alreadySent =
    messageProgress?.status === "sent" ||
    messageProgress?.status === "delivered";
  const alreadyDelivered = messageProgress?.status === "delivered";
  const isScheduled = !!scheduledAt && !alreadySent;

  async function handleSend() {
    if (!isOffline || sending || done) return;
    setSending(true);
    setError("");

    try {
      if (delayMornings) {
        const res = await adminFetch("/api/admin/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ track, chapterId, stepId: step.id, delayMornings }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Schedule failed.");
          return;
        }
        setDone(true);
        setTimeout(() => router.refresh(), 1200);
        return;
      }

      const sendRes = await adminFetch("/api/admin/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track, chapterId, stepId: step.id }),
      });

      const sendData = await sendRes.json();
      if (!sendRes.ok) {
        setError(sendData.error ?? "Send failed.");
        return;
      }

      if (isLetter) {
        const returnedMessageId = sendData.messageId ?? messageProgress?.id;
        const doneRes = await adminFetch("/api/admin/mark-done", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ track, messageId: returnedMessageId }),
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

  function renderDetails() {
    switch (step.type) {
      case "sms":
        return (
          <>
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
            <Detail label="Advance" value={COMPONENT_ADVANCE[step.component]} />
          </>
        );
    }
  }

  // Website steps: waiting for player
  if (step.type === "website") {
    return (
      <div className="admin-card px-4 py-3.5 mb-4">
        <StepHeader name={step.name} type={step.type} />
        {renderDetails()}
        <div className="flex items-center gap-2 mt-3 py-2.5 px-3 bg-amber-50 rounded-md border border-orange-200">
          <span className="w-2 h-2 rounded-full bg-admin-orange animate-admin-pulse" />
          <span className="text-[13px] text-orange-800 font-medium">
            Waiting for player...
          </span>
        </div>
        <div className="mt-3">
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

  // Offline steps
  const actionLabel = isLetter ? "RECEIVED" : delayMornings ? "SEND" : "SEND NOW";

  return (
    <div className="admin-card px-4 py-3.5 mb-4">
      <StepHeader name={step.name} type={step.type} />
      {location && <Detail label="Location" value={location} />}
      {renderDetails()}

      {alreadyDelivered ? (
        <StatusBadge text="Delivered" color="#2e7d32" icon={"\u2713"} />
      ) : alreadySent ? (
        <StatusBadge text="Sent" color="#c0a060" icon={"\u25D1"} />
      ) : done ? (
        <StatusBadge
          text={isLetter ? "Marked received" : "Sent successfully"}
          color="#2e7d32"
          icon={"\u2713"}
        />
      ) : isScheduled ? (
        <div className="mt-3">
          <div className="flex items-center gap-2 py-2.5 px-3 bg-amber-50 rounded-md border border-orange-200 mb-2">
            <span className="text-sm">{"\u23F1"}</span>
            <span className="text-[13px] text-orange-800 font-medium">
              Scheduled for{" "}
              {scheduledAt
                ? new Date(scheduledAt).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "later"}
            </span>
          </div>
          <button
            onClick={handleSend}
            disabled={sending}
            className={`admin-btn admin-focus w-full h-9 rounded-md text-[13px] font-bold tracking-[0.5px] text-white border-none font-inherit transition-colors duration-150 ${
              isLetter
                ? sending ? "bg-admin-green-disabled cursor-not-allowed" : "bg-admin-green hover:brightness-110 cursor-pointer"
                : sending ? "bg-admin-blue-disabled cursor-not-allowed" : "bg-admin-blue hover:bg-admin-blue-hover cursor-pointer"
            }`}
          >
            {sending ? "Processing..." : "SEND NOW"}
          </button>
        </div>
      ) : (
        <div className="mt-3">
          {supportsDelay && (
            <select
              value={delayMornings ?? ""}
              onChange={(e) =>
                setDelayMornings(e.target.value ? Number(e.target.value) : null)
              }
              className="admin-input admin-focus w-full h-9 px-2 border border-admin-border rounded-md text-xs font-inherit bg-admin-card text-admin-text mb-2 transition-colors"
            >
              <option value="">No delay</option>
              <option value="1">Next morning (4:30am)</option>
              <option value="2">2 mornings</option>
              <option value="3">3 mornings</option>
              <option value="4">4 mornings</option>
              <option value="5">5 mornings</option>
            </select>
          )}
          <button
            onClick={handleSend}
            disabled={sending}
            className={`admin-btn admin-focus w-full h-9 rounded-md text-[13px] font-bold tracking-[0.5px] text-white border-none font-inherit transition-colors duration-150 ${
              isLetter
                ? sending ? "bg-admin-green-disabled cursor-not-allowed" : "bg-admin-green hover:brightness-110 cursor-pointer"
                : sending ? "bg-admin-blue-disabled cursor-not-allowed" : "bg-admin-blue hover:bg-admin-blue-hover cursor-pointer"
            }`}
          >
            {sending ? "Processing..." : actionLabel}
          </button>
        </div>
      )}

      {error && (
        <div className="text-xs text-admin-red mt-2">
          {error}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepHeader({ name, type }: { name: string; type: string }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-[15px] font-semibold text-admin-text-dark">
        {name}
      </span>
      <span className="text-[10px] text-admin-text-faint uppercase tracking-[0.5px]">
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
      className={`flex gap-2 text-xs mb-1 ${
        multiline ? "items-start" : "items-center"
      }`}
    >
      <span
        className={`text-admin-text-faint font-semibold uppercase tracking-[0.5px] text-[10px] min-w-[52px] ${
          multiline ? "pt-0.5" : ""
        }`}
      >
        {label}
      </span>
      <span
        className={`text-admin-text ${
          multiline ? "whitespace-pre-wrap break-words" : ""
        }`}
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
      className="flex items-center gap-1.5 mt-3 text-[13px] font-medium"
      style={{ color }}
    >
      <span className="text-base">{icon}</span>
      {text}
    </div>
  );
}
