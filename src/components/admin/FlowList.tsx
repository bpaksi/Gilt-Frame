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
    if (progress?.status === "sent" || progress?.status === "delivered") {
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

  // For offline steps that are beyond current index but are the next sendable
  if (isOffline && index === currentFlowIndex) return "ready";

  // Check if this is the next offline step after current
  if (isOffline && index > currentFlowIndex) {
    // Allow sending the next immediate offline step
    if (index === currentFlowIndex + 1) return "ready";
    // Or if it's right after a website step
    return "locked";
  }

  return "locked";
}

export default function FlowList({
  chapterId,
  currentFlowIndex,
  messageProgress,
  track,
}: {
  chapterId: string;
  currentFlowIndex: number;
  messageProgress: MessageProgressRow[];
  track: "test" | "live";
}) {
  const chapter = chaptersConfig.chapters[chapterId];
  if (!chapter) return null;

  const orderedFlow = getOrderedFlow(chapter);

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
        Flow — {chapter.name}
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
        />
      ))}
    </div>
  );
}
