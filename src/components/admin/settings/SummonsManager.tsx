"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/admin/fetch";
import { gameConfig } from "@/config/chapters";

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

  const chapters = Object.entries(gameConfig.chapters);

  async function handleActivate(chapterId: string) {
    setActivating(chapterId);
    setError("");

    try {
      const res = await adminFetch("/api/admin/chapter/activate", {
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
        const hasSteps = Object.keys(chapter.steps).length > 0;

        return (
          <div
            key={id}
            style={{
              background: "#fff",
              border: "1px solid #d0d0d0",
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
              <div style={{ fontSize: "11px", color: "#666666" }}>
                {id}
                {chapter.window && ` \u2022 ${chapter.window}`}
                {isActive && (
                  <span
                    style={{
                      color: "#2e7d32",
                      fontWeight: 600,
                      marginLeft: "8px",
                    }}
                  >
                    ACTIVE
                  </span>
                )}
              </div>
            </div>

            {hasSteps && !isActive && (
              <button
                onClick={() => handleActivate(id)}
                disabled={activating === id}
                style={{
                  height: "28px",
                  padding: "0 12px",
                  background: activating === id ? "#5a8ab5" : "#336699",
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

            {!hasSteps && (
              <span style={{ fontSize: "11px", color: "#999999" }}>
                No steps
              </span>
            )}
          </div>
        );
      })}

      {error && (
        <div style={{ fontSize: "12px", color: "#c62828", marginTop: "8px" }}>
          {error}
        </div>
      )}
    </div>
  );
}
