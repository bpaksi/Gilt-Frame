"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetChapter({
  track,
  chapterId,
  chapterName,
}: {
  track: "test" | "live";
  chapterId: string;
  chapterName: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");

  if (track !== "test") return null;

  async function handleReset() {
    if (resetting) return;
    setResetting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/chapter/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track, chapterId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Reset failed.");
      } else {
        setConfirming(false);
        router.refresh();
      }
    } catch {
      setError("Network error.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        padding: "12px 16px",
        marginBottom: "16px",
      }}
    >
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          style={{
            height: "32px",
            padding: "0 16px",
            background: "#fff",
            color: "#dc2626",
            border: "1px solid #dc2626",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Reset Chapter
        </button>
      ) : (
        <div>
          <div style={{ fontSize: "13px", color: "#dc2626", marginBottom: "8px" }}>
            Reset all progress for &quot;{chapterName}&quot; on test track? This
            wipes message progress, quest state, answers, and hints.
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleReset}
              disabled={resetting}
              style={{
                height: "32px",
                padding: "0 16px",
                background: resetting ? "#fca5a5" : "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: resetting ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {resetting ? "Resetting..." : "Confirm Reset"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              style={{
                height: "32px",
                padding: "0 16px",
                background: "#fff",
                color: "#6b7280",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
          </div>
          {error && (
            <div style={{ fontSize: "12px", color: "#dc2626", marginTop: "6px" }}>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
