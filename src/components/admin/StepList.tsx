"use client";

import {
  gameConfig,
  getOrderedSteps,
  type Step,
} from "@/config";
import StepRow, { type StepState } from "./StepRow";
import type { MessageProgressRow } from "@/lib/admin/actions";

function getStepState(
  step: Step & { id: string },
  index: number,
  currentStepIndex: number,
  messageProgress: MessageProgressRow[]
): { state: StepState; messageId?: string } {
  const isOffline = step.type !== "website";

  if (isOffline) {
    // Find the primary recipient's message_progress row by step_id
    const progress = messageProgress.find(
      (mp) => mp.step_id === step.id && mp.to === step.config.to
    );
    if (progress?.status === "delivered") {
      return { state: "delivered", messageId: progress.id };
    }
    if (progress?.status === "sent") {
      return { state: "sent", messageId: progress.id };
    }
    if (progress?.status === "scheduled") {
      return { state: "scheduled" };
    }
  }

  if (index < currentStepIndex) return { state: "sent" };
  if (index === currentStepIndex) {
    return { state: isOffline ? "ready" : "active" };
  }

  return { state: "locked" };
}

export default function StepList({
  chapterId,
  currentStepIndex,
  messageProgress,
  track,
  readOnly,
}: {
  chapterId: string;
  currentStepIndex: number;
  messageProgress: MessageProgressRow[];
  track: "test" | "live";
  readOnly?: boolean;
}) {
  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) return null;

  const orderedSteps = getOrderedSteps(chapter);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #d0d0d0",
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
          color: "#666666",
          marginBottom: "8px",
        }}
      >
        {chapter.name}
      </div>
      {orderedSteps.map((step, index) => {
        const { state, messageId } = getStepState(
          step,
          index,
          currentStepIndex,
          messageProgress
        );
        return (
          <StepRow
            key={step.id}
            step={step}
            stepState={state}
            track={track}
            chapterId={chapterId}
            messageId={messageId}
            readOnly={readOnly}
          />
        );
      })}
    </div>
  );
}
