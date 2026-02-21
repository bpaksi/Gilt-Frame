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
        className={`bg-admin-card rounded-lg py-3 px-4 mb-4 border ${
          isReset ? "border-red-200" : "border-blue-200"
        }`}
      >
        <div className={`text-[13px] mb-2 ${isReset ? "text-admin-red" : "text-admin-text"}`}>
          {isReset
            ? "Purge all test track data? This wipes all chapters, messages, answers, activity, moments, and oracle history."
            : `Mark "${chapterName}" as complete? This adds completed_step rows for all remaining steps and marks the chapter done.`}
        </div>
        <div className="flex gap-2">
          <button
            onClick={isReset ? handleReset : handleComplete}
            disabled={loading}
            className={`admin-btn admin-focus h-8 px-4 text-white border-none rounded text-xs font-semibold font-inherit transition-colors duration-150 ${
              loading
                ? isReset ? "bg-red-300 cursor-not-allowed" : "bg-blue-300 cursor-not-allowed"
                : isReset ? "bg-admin-red hover:bg-admin-red-hover cursor-pointer" : "bg-admin-blue hover:bg-admin-blue-hover cursor-pointer"
            }`}
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
          <button
            onClick={() => { setConfirmAction(null); setError(""); }}
            className="admin-focus h-8 px-4 bg-admin-card text-admin-text-muted border border-admin-border rounded text-xs cursor-pointer font-inherit transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
        {error && (
          <div className="text-xs text-admin-red mt-1.5">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => setConfirmAction("complete")}
        className="admin-btn admin-focus h-8 px-4 bg-admin-card text-admin-blue border border-admin-blue rounded text-xs font-semibold cursor-pointer font-inherit transition-colors hover:bg-admin-blue hover:text-white"
      >
        Complete Chapter
      </button>
      <button
        onClick={() => setConfirmAction("reset")}
        className="admin-btn admin-focus h-8 px-4 bg-admin-card text-admin-red border border-admin-red rounded text-xs font-semibold cursor-pointer font-inherit transition-colors hover:bg-admin-red hover:text-white"
      >
        Reset All Data
      </button>
    </div>
  );
}
