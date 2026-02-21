"use client";

import Accordion from "@/components/ui/Accordion";
import EmptyState from "@/components/ui/EmptyState";
import { colors, fontFamily } from "@/components/ui/tokens";

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
  if (conversations.length === 0) {
    return (
      <EmptyState style={{ color: colors.gold35, fontSize: "14px", letterSpacing: undefined, padding: "40px 0" }}>
        No questions have been asked yet.
        <br />
        The Oracle awaits.
      </EmptyState>
    );
  }

  const reversed = [...conversations].reverse();

  return (
    <Accordion
      items={reversed}
      keyExtractor={(_, i) => String(i)}
      renderHeader={(conv) => (
        <>
          <span
            style={{
              color: colors.gold70,
              fontFamily,
              fontSize: "15px",
              fontStyle: "italic",
            }}
          >
            {conv.question}
          </span>
          <span
            style={{
              color: colors.gold25,
              fontFamily,
              fontSize: "11px",
              fontStyle: "italic",
              flexShrink: 0,
            }}
          >
            {relativeTime(conv.created_at)}
          </span>
        </>
      )}
      renderBody={(conv) => <>{conv.response}</>}
    />
  );
}
