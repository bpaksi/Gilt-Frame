"use client";

import { useState } from "react";
import { chaptersConfig } from "@/config/chapters";

type ChapterStatus = {
  chapterId: string;
  name: string;
  hasProgress: boolean;
};

export default function SummonsManager({
  track,
  chapterStatuses,
}: {
  track: "test" | "live";
  chapterStatuses: ChapterStatus[];
}) {
  const [activating, setActivating] = useState<string | null>(null);
  const [error, setError] = useState("");

  const chapters = Object.entries(chaptersConfig.chapters);

  async function handleActivate(chapterId: string) {
    setActivating(chapterId);
    setError("");

    try {
      const res = await fetch("/api/admin/chapter/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track, chapterId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Activation failed.");
      } else {
        window.location.reload();
      }
    } catch {
      setError("Network error.");
    } finally {
      setActivating(null);
    }
  }

  return (
    <div>
      {chapters.map(([id, chapter]) => {
        const status = chapterStatuses.find((s) => s.chapterId === id);
        const isActive = status?.hasProgress;
        const hasFlow = Object.keys(chapter.flow).length > 0;

        return (
          <div
            key={id}
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>
                {chapter.name}
              </div>
              <div style={{ fontSize: "11px", color: "#6b7280" }}>
                {id}
                {chapter.window && ` \u2022 ${chapter.window}`}
                {isActive && (
                  <span
                    style={{
                      color: "#16a34a",
                      fontWeight: 600,
                      marginLeft: "8px",
                    }}
                  >
                    ACTIVE
                  </span>
                )}
              </div>
            </div>

            {hasFlow && !isActive && (
              <button
                onClick={() => handleActivate(id)}
                disabled={activating === id}
                style={{
                  height: "28px",
                  padding: "0 12px",
                  background: activating === id ? "#93b5f5" : "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: activating === id ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {activating === id ? "..." : "Activate"}
              </button>
            )}

            {!hasFlow && (
              <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                No flow
              </span>
            )}
          </div>
        );
      })}

      {error && (
        <div style={{ fontSize: "12px", color: "#dc2626", marginTop: "8px" }}>
          {error}
        </div>
      )}
    </div>
  );
}
