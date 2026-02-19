"use client";

import {
  gameConfig,
  getOrderedSteps,
  type Step,
} from "@/config";
import StepRow, { type StepState } from "./StepRow";
import type { MessageProgressRow } from "@/lib/admin/actions";

function getStepState(
  step: Step,
  index: number,
  currentStepIndex: number,
  messageProgress: MessageProgressRow[]
): StepState {
  const isOffline = step.type !== "website";

  if (isOffline) {
    const progress = messageProgress.find(
      (mp) => mp.progress_key === step.config.progress_key
    );
    if (progress?.status === "delivered") {
      return "delivered";
    }
    if (progress?.status === "sent") {
      return "sent";
    }
    if (progress?.status === "scheduled") {
      return "scheduled";
    }
  }

  if (index < currentStepIndex) return "sent";
  if (index === currentStepIndex) {
    return isOffline ? "ready" : "active";
  }

  return "locked";
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
        Pipeline — {chapter.name}
      </div>
      {orderedSteps.map((step, index) => (
        <StepRow
          key={step.id}
          step={step}
          stepState={getStepState(
            step,
            index,
            currentStepIndex,
            messageProgress
          )}
          track={track}
          chapterId={chapterId}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
