"use client";

import { useMemo, useState } from "react";
import type {
  PlayerEvent,
  ChapterProgressRow,
  MessageProgressRow,
  CompletedStepCount,
} from "@/lib/admin/actions";
import { gameConfig, getOrderedSteps } from "@/config";
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
    case "complete_step":
      return "\u23E9";
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
  complete_step: "step completed",
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

  const completedChapterIds = useMemo(() => {
    return new Set(
      chapterProgress
        .filter((cp) => !!cp.completed_at)
        .map((cp) => cp.chapter_id)
    );
  }, [chapterProgress]);

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
    if (!chapterFilter) return messageProgress;
    const chapter = gameConfig.chapters[chapterFilter];
    if (!chapter) return [];
    const stepIds = new Set(getOrderedSteps(chapter).map((s) => s.id));
    return messageProgress.filter((mp) => mp.step_id && stepIds.has(mp.step_id));
  }, [chapterFilter, messageProgress]);

  return (
    <div>
      <TimelineFilters
        selectedChapter={chapterFilter}
        onChapterChange={setChapterFilter}
        completedChapterIds={completedChapterIds}
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

      <div className="admin-card py-3 px-4">
        {filtered.length === 0 ? (
          <div className="text-[13px] text-admin-text-faint py-5 text-center">
            No events yet.
          </div>
        ) : (
          filtered.map((event) => {
            const details = event.details as Record<string, unknown> | null;
            return (
              <div
                key={event.id}
                className="flex gap-2.5 py-2 border-b border-admin-border-light items-start last:border-b-0 transition-colors hover:bg-gray-50 -mx-2 px-2 rounded-sm"
              >
                <span className="text-sm w-5 text-center shrink-0 pt-px">
                  {eventIcon(event.event_type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium flex items-center gap-1.5">
                    {eventDisplayName(event.event_type)}
                    {event.source === "admin" && (
                      <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-px rounded-sm font-semibold uppercase tracking-[0.5px]">
                        admin
                      </span>
                    )}
                  </div>
                  {typeof details?.step_name === "string" && (
                    <div className="text-[11px] text-admin-text-muted">
                      {details.step_name}
                    </div>
                  )}
                  {typeof details?.chapter_id === "string" && (
                    <div className="text-[10px] text-admin-text-faint">
                      {details.chapter_id}
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-admin-text-faint whitespace-nowrap shrink-0">
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
