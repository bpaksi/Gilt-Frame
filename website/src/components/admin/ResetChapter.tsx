"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/fetch";

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

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

  const isReset = confirmAction === "reset";

  return (
    <div className="rounded-xl border border-admin-border overflow-hidden" style={{ background: "#f6f5f3" }}>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-admin-border" style={{ background: "#efede9" }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#e68a00" }} />
        <span className="font-mono text-[9.5px] tracking-[2.5px] uppercase" style={{ color: "#9a7200" }}>
          Test Track
        </span>
      </div>

      {/* Confirm state */}
      {confirmAction ? (
        <div className="px-4 py-4">
          <p className={`text-[13px] leading-relaxed mb-3 ${isReset ? "text-admin-red" : "text-admin-text"}`}>
            {isReset
              ? "Purge all test track data? This wipes all chapters, messages, answers, activity, moments, and oracle history."
              : `Mark "${chapterName}" as complete? This adds completed step rows for all remaining steps and marks the chapter done.`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={isReset ? handleReset : handleComplete}
              disabled={loading}
              className={`admin-btn admin-focus h-8 px-4 text-white border-none rounded-md text-xs font-semibold font-inherit transition-colors duration-150 ${
                loading
                  ? isReset ? "bg-red-300 cursor-not-allowed" : "bg-blue-300 cursor-not-allowed"
                  : isReset
                  ? "bg-admin-red hover:bg-admin-red-hover cursor-pointer"
                  : "bg-admin-blue hover:bg-admin-blue-hover cursor-pointer"
              }`}
            >
              {loading ? "Processing..." : "Confirm"}
            </button>
            <button
              onClick={() => { setConfirmAction(null); setError(""); }}
              className="admin-focus h-8 px-4 bg-admin-card text-admin-text-muted border border-admin-border rounded-md text-xs cursor-pointer font-inherit transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-xs text-admin-red mt-2">{error}</p>}
        </div>
      ) : (
        <div className="divide-y divide-admin-border">

          {/* Complete Chapter */}
          <button
            onClick={() => setConfirmAction("complete")}
            className="admin-focus w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer group transition-colors duration-150 hover:bg-white/70 border-none bg-transparent font-inherit"
          >
            <span
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-admin-blue transition-colors duration-150 group-hover:bg-white"
              style={{ background: "rgba(51,102,153,0.10)" }}
            >
              <CheckIcon />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-admin-text-dark">Complete Chapter</div>
              <div className="text-[11px] text-admin-text-faint mt-0.5 truncate">{chapterName}</div>
            </div>
            <span className="text-admin-text-faint text-[13px] opacity-0 group-hover:opacity-100 transition-opacity duration-150">→</span>
          </button>

          {/* Reset All Data */}
          <button
            onClick={() => setConfirmAction("reset")}
            className="admin-focus w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer group transition-colors duration-150 hover:bg-white/70 border-none bg-transparent font-inherit"
          >
            <span
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-admin-red transition-colors duration-150 group-hover:bg-white"
              style={{ background: "rgba(198,40,40,0.09)" }}
            >
              <TrashIcon />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-admin-text-dark">Reset All Data</div>
              <div className="text-[11px] text-admin-text-faint mt-0.5">Wipe all test track data</div>
            </div>
            <span className="text-admin-text-faint text-[13px] opacity-0 group-hover:opacity-100 transition-opacity duration-150">→</span>
          </button>

        </div>
      )}
    </div>
  );
}
