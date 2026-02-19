"use client";

import { chaptersConfig } from "@/config/chapters";

const EVENT_TYPES = [
  "sms_sent",
  "email_sent",
  "quest_advanced",
  "quest_completed",
  "answer_submitted",
  "hint_requested",
  "hint_pushed",
  "oracle_question",
  "chapter_activated",
  "moment_created",
] as const;

export default function TimelineFilters({
  selectedChapter,
  selectedTypes,
  onChapterChange,
  onTypesChange,
}: {
  selectedChapter: string;
  selectedTypes: string[];
  onChapterChange: (chapterId: string) => void;
  onTypesChange: (types: string[]) => void;
}) {
  const chapters = Object.entries(chaptersConfig.chapters);

  function toggleType(type: string) {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "12px 16px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <select
          value={selectedChapter}
          onChange={(e) => onChapterChange(e.target.value)}
          style={{
            height: "32px",
            padding: "0 8px",
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
            fontSize: "12px",
            fontFamily: "inherit",
            background: "#fff",
            color: "#1a1a1a",
          }}
        >
          <option value="">All Chapters</option>
          {chapters.map(([id, ch]) => (
            <option key={id} value={id}>
              {ch.name}
            </option>
          ))}
        </select>

        <div
          style={{
            display: "flex",
            gap: "4px",
            flexWrap: "wrap",
          }}
        >
          {EVENT_TYPES.map((type) => {
            const active = selectedTypes.length === 0 || selectedTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                style={{
                  height: "24px",
                  padding: "0 8px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "10px",
                  fontFamily: "inherit",
                  background: active ? "#eff6ff" : "#fff",
                  color: active ? "#2563eb" : "#9ca3af",
                  cursor: "pointer",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {type.replace("_", " ")}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
