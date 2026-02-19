"use client";

import { useState } from "react";
import type { PlayerEvent } from "@/lib/admin/actions";
import TimelineFilters from "./TimelineFilters";

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
      return "\uD83D\uDCF1";
    case "email_sent":
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
      return "\uD83D\uDD13";
    case "moment_created":
      return "\uD83D\uDCF8";
    default:
      return "\u25CF";
  }
}

export default function EventTimeline({
  events,
}: {
  events: PlayerEvent[];
}) {
  const [chapterFilter, setChapterFilter] = useState("");
  const [typeFilters, setTypeFilters] = useState<string[]>([]);

  const filtered = events.filter((e) => {
    if (chapterFilter) {
      const details = e.details as Record<string, unknown> | null;
      if (details?.chapter_id !== chapterFilter) return false;
    }
    if (typeFilters.length > 0 && !typeFilters.includes(e.event_type)) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <TimelineFilters
        selectedChapter={chapterFilter}
        selectedTypes={typeFilters}
        onChapterChange={setChapterFilter}
        onTypesChange={setTypeFilters}
      />

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "12px 16px",
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#9ca3af", padding: "20px 0", textAlign: "center" }}>
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
                  borderBottom: "1px solid #f3f4f6",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: "14px", width: "20px", textAlign: "center", flexShrink: 0, paddingTop: "1px" }}>
                  {eventIcon(event.event_type)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500 }}>
                    {event.event_type.replace(/_/g, " ")}
                  </div>
                  {typeof details?.step_name === "string" && (
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>
                      {details.step_name}
                    </div>
                  )}
                  {typeof details?.chapter_id === "string" && (
                    <div style={{ fontSize: "10px", color: "#9ca3af" }}>
                      {details.chapter_id}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
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
