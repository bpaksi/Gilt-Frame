"use client";

import { gameConfig } from "@/config";

export default function TimelineFilters({
  selectedChapter,
  onChapterChange,
  completedChapterIds,
}: {
  selectedChapter: string;
  onChapterChange: (chapterId: string) => void;
  completedChapterIds?: Set<string>;
}) {
  const chapters = Object.entries(gameConfig.chapters);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #d0d0d0",
        borderRadius: "8px",
        padding: "12px 16px",
        marginBottom: "16px",
      }}
    >
      <select
        value={selectedChapter}
        onChange={(e) => onChapterChange(e.target.value)}
        style={{
          height: "32px",
          padding: "0 8px",
          border: "1px solid #d0d0d0",
          borderRadius: "4px",
          fontSize: "12px",
          fontFamily: "inherit",
          background: "#fff",
          color: "#333333",
        }}
      >
        {chapters.map(([id, ch], index) => (
          <option key={id} value={id}>
            {index} — {ch.name}{completedChapterIds?.has(id) ? " (done)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
