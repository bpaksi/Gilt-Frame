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
    <div className="admin-card py-3 px-4 mb-4">
      <select
        value={selectedChapter}
        onChange={(e) => onChapterChange(e.target.value)}
        className="admin-input admin-focus h-8 px-2 border border-admin-border rounded text-xs font-inherit bg-admin-card text-admin-text transition-colors"
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
