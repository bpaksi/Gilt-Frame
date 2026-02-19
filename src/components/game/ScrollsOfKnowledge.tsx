"use client";

import { useState } from "react";
import type { DisplayLoreEntry } from "@/lib/lore";

interface ScrollsOfKnowledgeProps {
  entries: DisplayLoreEntry[];
  completedChapters: string[];
}

export default function ScrollsOfKnowledge({
  entries,
  completedChapters,
}: ScrollsOfKnowledgeProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1px",
      }}
    >
      <p
        style={{
          color: "rgba(200, 165, 75, 0.4)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "3px",
          marginBottom: "16px",
        }}
      >
        Scrolls of Knowledge
      </p>

      {entries.map((entry) => {
        const isUnlocked =
          !entry.unlock_chapter_id ||
          completedChapters.includes(entry.unlock_chapter_id);
        const isExpanded = expandedId === entry.id;

        return (
          <div key={entry.id}>
            <button
              onClick={() => {
                if (isUnlocked) {
                  setExpandedId(isExpanded ? null : entry.id);
                }
              }}
              style={{
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                borderBottom: "1px solid rgba(200, 165, 75, 0.08)",
                padding: "14px 0",
                cursor: isUnlocked ? "pointer" : "default",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                minHeight: "44px",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span
                style={{
                  color: isUnlocked
                    ? "rgba(200, 165, 75, 0.7)"
                    : "rgba(200, 165, 75, 0.25)",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "15px",
                  fontStyle: "italic",
                }}
              >
                {entry.title}
              </span>
              {!isUnlocked && (
                <span
                  style={{
                    color: "rgba(200, 165, 75, 0.2)",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: "11px",
                    fontStyle: "italic",
                  }}
                >
                  Locked
                </span>
              )}
            </button>

            {isExpanded && isUnlocked && (
              <div
                style={{
                  padding: "12px 0 20px 0",
                  opacity: 0,
                  animation: "fade-in 0.4s ease forwards",
                }}
              >
                <p
                  style={{
                    color: "rgba(200, 165, 75, 0.6)",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: "14px",
                    fontStyle: "italic",
                    lineHeight: 1.8,
                  }}
                >
                  {entry.content}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
