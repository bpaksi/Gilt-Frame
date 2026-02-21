"use client";

import { useState } from "react";

type Conversation = {
  question: string;
  response: string;
  created_at: string;
};

function relativeTime(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return "1 minute";
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hour";
  if (hours < 24) return `${hours} hours`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day";
  return `${days} days`;
}

interface OracleHistoryProps {
  conversations: Conversation[];
}

export default function OracleHistory({ conversations }: OracleHistoryProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (conversations.length === 0) {
    return (
      <p
        style={{
          color: "rgba(200, 165, 75, 0.35)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "14px",
          fontStyle: "italic",
          textAlign: "center",
          lineHeight: 1.8,
          padding: "40px 0",
        }}
      >
        No questions have been asked yet.
        <br />
        The Oracle awaits.
      </p>
    );
  }

  const reversed = [...conversations].reverse();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
      {reversed.map((conv, i) => {
        const isExpanded = expandedIndex === i;

        return (
          <div key={i}>
            <button
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
              style={{
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                borderBottom: "1px solid rgba(200, 165, 75, 0.08)",
                padding: "14px 0",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                minHeight: "44px",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span
                style={{
                  color: "rgba(200, 165, 75, 0.7)",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "15px",
                  fontStyle: "italic",
                }}
              >
                {conv.question}
              </span>
              <span
                style={{
                  color: "rgba(200, 165, 75, 0.25)",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "11px",
                  fontStyle: "italic",
                  flexShrink: 0,
                }}
              >
                {relativeTime(conv.created_at)}
              </span>
            </button>

            {isExpanded && (
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
                  {conv.response}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
