"use client";

import {
  chaptersConfig,
  getOrderedFlow,
  type FlowStep,
} from "@/config/chapters";
import FlowStepRow, { type StepState } from "./FlowStepRow";
import type { MessageProgressRow } from "@/lib/admin/actions";

function getStepState(
  step: FlowStep,
  index: number,
  currentFlowIndex: number,
  messageProgress: MessageProgressRow[]
): StepState {
  const isOffline = step.type !== "website";

  if (isOffline && "progress_key" in step) {
    const progress = messageProgress.find(
      (mp) => mp.progress_key === step.progress_key
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

  if (index < currentFlowIndex) return "sent";
  if (index === currentFlowIndex) {
    return isOffline ? "ready" : "active";
  }

  return "locked";
}

export default function FlowList({
  chapterId,
  currentFlowIndex,
  messageProgress,
  track,
  readOnly,
}: {
  chapterId: string;
  currentFlowIndex: number;
  messageProgress: MessageProgressRow[];
  track: "test" | "live";
  readOnly?: boolean;
}) {
  const chapter = chaptersConfig.chapters[chapterId];
  if (!chapter) return null;

  const orderedFlow = getOrderedFlow(chapter);

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
      {orderedFlow.map((step, index) => (
        <FlowStepRow
          key={step.id}
          step={step}
          stepState={getStepState(
            step,
            index,
            currentFlowIndex,
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
