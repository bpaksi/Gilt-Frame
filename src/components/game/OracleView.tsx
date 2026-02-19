"use client";

import ScrollsOfKnowledge from "./ScrollsOfKnowledge";
import AskTheOracle from "./AskTheOracle";

type LoreEntry = {
  id: string;
  title: string;
  content: string;
  unlock_chapter_id: string | null;
  unlocked: boolean;
};

type Conversation = {
  question: string;
  response: string;
};

interface OracleViewProps {
  loreEntries: LoreEntry[];
  completedChapters: string[];
  conversations: Conversation[];
}

export default function OracleView({
  loreEntries,
  completedChapters,
  conversations,
}: OracleViewProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "48px",
        padding: "24px 16px",
        flex: 1,
      }}
    >
      <ScrollsOfKnowledge entries={loreEntries} completedChapters={completedChapters} />
      <AskTheOracle initialConversations={conversations} />
    </div>
  );
}
