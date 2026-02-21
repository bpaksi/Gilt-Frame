"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/admin/fetch";
import {
  gameConfig,
  getOrderedSteps,
  type HintItem,
} from "@/config";

export default function HintPush({
  track,
  chapterId,
  stepIndex,
  revealedTiers,
}: {
  track: "test" | "live";
  chapterId: string;
  stepIndex: number;
  revealedTiers: number[];
}) {
  const [pushing, setPushing] = useState(false);
  const [lastPushed, setLastPushed] = useState<string | null>(null);
  const [error, setError] = useState("");

  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) return null;

  const orderedSteps = getOrderedSteps(chapter);
  const step = orderedSteps[stepIndex];
  if (!step || step.type !== "website") return null;

  const config = step.config as { hints?: HintItem[] };
  if (!config.hints || config.hints.length === 0) return null;

  const nextTier = config.hints.find(
    (h) => !revealedTiers.includes(h.tier)
  );

  async function handlePush() {
    if (!nextTier || pushing) return;
    setPushing(true);
    setError("");

    try {
      const res = await adminFetch("/api/admin/hint/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          chapterId,
          stepIndex,
          hintTier: nextTier.tier,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Push failed.");
      } else {
        setLastPushed(`Tier ${nextTier.tier}: ${data.hint}`);
      }
    } catch {
      setError("Network error.");
    } finally {
      setPushing(false);
    }
  }

  return (
    <div className="admin-card py-3 px-4 mb-4">
      <div className="text-[11px] font-semibold tracking-[1.5px] uppercase text-admin-text-muted mb-2">
        Alerts — {revealedTiers.length}/{config.hints.length} revealed
      </div>

      {nextTier ? (
        <div className="flex items-center gap-2.5">
          <div className="flex-1 text-[13px] text-admin-text">
            Next: Tier {nextTier.tier}
          </div>
          <button
            onClick={handlePush}
            disabled={pushing}
            className={`admin-btn admin-focus h-7 px-3 text-white border-none rounded text-[11px] font-semibold transition-colors duration-150 ${
              pushing
                ? "bg-[#f0a830] cursor-not-allowed"
                : "bg-admin-orange hover:brightness-110 cursor-pointer"
            }`}
          >
            {pushing ? "..." : "PUSH ALERT"}
          </button>
        </div>
      ) : (
        <div className="text-[13px] text-admin-text-faint">
          All alerts revealed.
        </div>
      )}

      {lastPushed && (
        <div className="text-xs text-admin-green mt-1.5">
          {lastPushed}
        </div>
      )}

      {error && (
        <div className="text-xs text-admin-red mt-1.5">
          {error}
        </div>
      )}
    </div>
  );
}
