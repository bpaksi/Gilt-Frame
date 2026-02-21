"use client";

import Accordion from "@/components/ui/Accordion";
import EmptyState from "@/components/ui/EmptyState";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { DisplayLoreEntry } from "@/lib/lore";

interface ScrollsOfKnowledgeProps {
  entries: DisplayLoreEntry[];
}

export default function ScrollsOfKnowledge({
  entries,
}: ScrollsOfKnowledgeProps) {
  const unlockedEntries = entries.filter((e) => e.unlocked);

  if (unlockedEntries.length === 0) {
    return (
      <EmptyState style={{ color: colors.gold35, fontSize: "14px", letterSpacing: undefined, padding: "40px 0" }}>
        No scrolls have been revealed yet.
        <br />
        Continue your journey, Sparrow.
      </EmptyState>
    );
  }

  return (
    <Accordion
      items={unlockedEntries}
      keyExtractor={(e) => e.id}
      renderHeader={(e) => (
        <span
          style={{
            color: colors.gold70,
            fontFamily,
            fontSize: "15px",
            fontStyle: "italic",
          }}
        >
          {e.title}
        </span>
      )}
      renderBody={(e) => <>{e.content}</>}
    />
  );
}
