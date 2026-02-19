"use client";

import { useMemo, useState } from "react";
import type {
  PlayerEvent,
  ChapterProgressRow,
  MessageProgressRow,
  CompletedStepCount,
} from "@/lib/admin/actions";
import { gameConfig, getOrderedSteps } from "@/config/chapters";
import TimelineFilters from "./TimelineFilters";
import StepList from "./StepList";

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function eventIcon(type: string): string {
  switch (type) {
    case "sms_sent":
    case "send_step":
      return "\uD83D\uDCF1";
    case "email_sent":
    case "send_ad_hoc":
      return "\u2709\uFE0F";
    case "quest_advanced":
      return "\u25B6";
    case "quest_completed":
      return "\uD83C\uDFC6";
    case "answer_submitted":
      return "\u2714";
    case "hint_requested":
    case "hint_pushed":
      return "\uD83D\uDCA1";
    case "oracle_question":
      return "\uD83D\uDD2E";
    case "chapter_activated":
    case "activate_chapter":
      return "\uD83D\uDD13";
    case "moment_created":
      return "\uD83D\uDCF8";
    case "passphrase_entered":
      return "\uD83D\uDD11";
    case "mark_done":
      return "\u2705";
    case "reset_chapter":
      return "\uD83D\uDD04";
    default:
      return "\u25CF";
  }
}

const EVENT_DISPLAY_NAMES: Record<string, string> = {
  quest_advanced: "step advanced",
  quest_completed: "task completed",
  oracle_question: "ai question",
  chapter_activated: "workflow activated",
  moment_created: "snapshot created",
  hint_requested: "alert requested",
  hint_pushed: "alert pushed",
  passphrase_entered: "passphrase entered",
  send_step: "message sent",
  send_ad_hoc: "ad-hoc message sent",
  mark_done: "marked delivered",
  activate_chapter: "chapter activated",
  reset_chapter: "chapter reset",
};

function eventDisplayName(eventType: string): string {
  return EVENT_DISPLAY_NAMES[eventType] ?? eventType.replace(/_/g, " ");
}

export default function EventTimeline({
  events,
  initialChapter,
  chapterProgress,
  messageProgress,
  completedStepCounts,
  track,
}: {
  events: PlayerEvent[];
  initialChapter: string;
  chapterProgress: ChapterProgressRow[];
  messageProgress: MessageProgressRow[];
  completedStepCounts: CompletedStepCount[];
  track: "test" | "live";
}) {
  const [chapterFilter, setChapterFilter] = useState(initialChapter);

  const filtered = events.filter((e) => {
    if (chapterFilter) {
      const details = e.details as Record<string, unknown> | null;
      if (details?.chapter_id !== chapterFilter) return false;
    }
    return true;
  });

  const chapterStepIndex = useMemo(() => {
    if (!chapterFilter) return 0;
    const cp = chapterProgress.find((c) => c.chapter_id === chapterFilter);
    if (!cp) return 0;
    if (cp.completed_at !== null) {
      const chapter = gameConfig.chapters[chapterFilter];
      return chapter ? getOrderedSteps(chapter).length : 0;
    }
    const stepCount = completedStepCounts.find(
      (c) => c.chapter_id === chapterFilter
    );
    return stepCount?.count ?? 0;
  }, [chapterFilter, chapterProgress, completedStepCounts]);

  const chapterMessages = useMemo(() => {
    if (!chapterFilter) return [];
    return messageProgress.filter((mp) =>
      mp.progress_key.startsWith(`${chapterFilter}.`)
    );
  }, [chapterFilter, messageProgress]);

  return (
    <div>
      <TimelineFilters
        selectedChapter={chapterFilter}
        onChapterChange={setChapterFilter}
      />

      {chapterFilter && (
        <StepList
          chapterId={chapterFilter}
          currentStepIndex={chapterStepIndex}
          messageProgress={chapterMessages}
          track={track}
          readOnly
        />
      )}

      <div
        style={{
          background: "#fff",
          border: "1px solid #d0d0d0",
          borderRadius: "8px",
          padding: "12px 16px",
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#999999", padding: "20px 0", textAlign: "center" }}>
            No events yet.
          </div>
        ) : (
          filtered.map((event) => {
            const details = event.details as Record<string, unknown> | null;
            return (
              <div
                key={event.id}
                style={{
                  display: "flex",
                  gap: "10px",
                  padding: "8px 0",
                  borderBottom: "1px solid #e8e8e8",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: "14px", width: "20px", textAlign: "center", flexShrink: 0, paddingTop: "1px" }}>
                  {eventIcon(event.event_type)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
                    {eventDisplayName(event.event_type)}
                    {event.source === "admin" && (
                      <span style={{ fontSize: "9px", background: "#e8e0f0", color: "#6b4c9a", padding: "1px 5px", borderRadius: "3px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        admin
                      </span>
                    )}
                  </div>
                  {typeof details?.step_name === "string" && (
                    <div style={{ fontSize: "11px", color: "#666666" }}>
                      {details.step_name}
                    </div>
                  )}
                  {typeof details?.chapter_id === "string" && (
                    <div style={{ fontSize: "10px", color: "#999999" }}>
                      {details.chapter_id}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#999999",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {formatTime(event.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
