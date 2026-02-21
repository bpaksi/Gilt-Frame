"use client";

import { useState } from "react";
import type { DisplayLoreEntry } from "@/lib/lore";
import { colors, fontFamily, MIN_TAP_TARGET } from "@/components/ui/tokens";
import ScrollsOfKnowledge from "./ScrollsOfKnowledge";
import AskTheOracle from "./AskTheOracle";
import OracleHistory from "./OracleHistory";
import type { ShowcaseDefinition } from "@/components/showcase";

type Conversation = {
  question: string;
  response: string;
  created_at: string;
};

type Tab = "question" | "scrolls" | "history";

interface OracleViewProps {
  loreEntries: DisplayLoreEntry[];
  conversations: Conversation[];
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  background: "none",
  border: "none",
  borderBottom: active ? `1px solid ${colors.gold30}` : "1px solid transparent",
  padding: "0 0 8px 0",
  color: active ? colors.gold70 : colors.gold30,
  fontFamily,
  fontSize: "13px",
  fontStyle: "italic",
  textTransform: "uppercase" as const,
  letterSpacing: "3px",
  cursor: "pointer",
  minHeight: MIN_TAP_TARGET,
  WebkitTapHighlightColor: "transparent",
});

export default function OracleView({
  loreEntries,
  conversations: initialConversations,
}: OracleViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("question");
  const [conversations, setConversations] = useState(initialConversations);

  const handleNewConversation = (conv: Conversation) => {
    setConversations((prev) => [...prev, conv]);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        flex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        <button style={tabStyle(activeTab === "question")} onClick={() => setActiveTab("question")}>
          Question
        </button>
        <button style={tabStyle(activeTab === "scrolls")} onClick={() => setActiveTab("scrolls")}>
          Scrolls
        </button>
        <button style={tabStyle(activeTab === "history")} onClick={() => setActiveTab("history")}>
          History
        </button>
      </div>

      {activeTab === "question" && <AskTheOracle onConversation={handleNewConversation} />}
      {activeTab === "scrolls" && <ScrollsOfKnowledge entries={loreEntries} />}
      {activeTab === "history" && <OracleHistory conversations={conversations} />}
    </div>
  );
}

export const showcase: ShowcaseDefinition<OracleViewProps> = {
  category: "game",
  label: "Oracle View",
  description: "Tabbed interface: Ask Oracle, Scrolls of Knowledge, History",
  uses: ["AskTheOracle", "ScrollsOfKnowledge", "OracleHistory"],
  defaults: { loreEntries: [], conversations: [] },
};
