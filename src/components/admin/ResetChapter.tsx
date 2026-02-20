"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/fetch";

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
  const [confirmAction, setConfirmAction] = useState<"reset" | "complete" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (track !== "test") return null;

  async function handleReset() {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await adminFetch("/api/admin/chapter/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Reset failed.");
      } else {
        setConfirmAction(null);
        router.refresh();
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await adminFetch("/api/admin/chapter/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track, chapterId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Complete failed.");
      } else {
        setConfirmAction(null);
        router.refresh();
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  if (confirmAction) {
    const isReset = confirmAction === "reset";
    return (
      <div
        style={{
          background: "#fff",
          border: `1px solid ${isReset ? "#e0b0b0" : "#b0c0e0"}`,
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "16px",
        }}
      >
        <div style={{ fontSize: "13px", color: isReset ? "#c62828" : "#333333", marginBottom: "8px" }}>
          {isReset
            ? "Purge all test track data? This wipes all chapters, messages, answers, activity, moments, and oracle history."
            : `Mark "${chapterName}" as complete? This adds completed_step rows for all remaining steps and marks the chapter done.`}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={isReset ? handleReset : handleComplete}
            disabled={loading}
            style={{
              height: "32px",
              padding: "0 16px",
              background: loading
                ? (isReset ? "#e08080" : "#8090b0")
                : (isReset ? "#c62828" : "#336699"),
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
          <button
            onClick={() => { setConfirmAction(null); setError(""); }}
            style={{
              height: "32px",
              padding: "0 16px",
              background: "#fff",
              color: "#666666",
              border: "1px solid #d0d0d0",
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
          <div style={{ fontSize: "12px", color: "#c62828", marginTop: "6px" }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        marginBottom: "16px",
      }}
    >
      <button
        onClick={() => setConfirmAction("complete")}
        style={{
          height: "32px",
          padding: "0 16px",
          background: "#fff",
          color: "#336699",
          border: "1px solid #336699",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Complete Chapter
      </button>
      <button
        onClick={() => setConfirmAction("reset")}
        style={{
          height: "32px",
          padding: "0 16px",
          background: "#fff",
          color: "#c62828",
          border: "1px solid #c62828",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Reset All Data
      </button>
    </div>
  );
}
