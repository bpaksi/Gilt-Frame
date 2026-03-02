"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/fetch";

export default function ActivateChapterButton({
  chapterId,
  chapterName,
  track,
}: {
  chapterId: string;
  chapterName: string;
  track: "test" | "live";
}) {
  const router = useRouter();
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");

  async function handleActivate() {
    if (activating) return;
    setActivating(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/chapter/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track, chapterId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Activate failed.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error.");
    } finally {
      setActivating(false);
    }
  }

  return (
    <div className="admin-card px-4 py-3.5 mb-4">
      <div className="text-[10px] font-semibold tracking-[1px] uppercase text-admin-text-faint mb-1">
        Next Up
      </div>
      <div className="text-base font-semibold text-admin-text-dark mb-3">
        {chapterName}
      </div>
      <button
        onClick={handleActivate}
        disabled={activating}
        className={`admin-btn admin-focus w-full h-9 rounded-md text-[13px] font-bold tracking-[0.5px] text-white border-none font-inherit transition-colors duration-150 ${
          activating
            ? "bg-admin-green-disabled cursor-not-allowed"
            : "bg-admin-green hover:brightness-110 cursor-pointer"
        }`}
      >
        {activating ? "Activating…" : "Activate Chapter"}
      </button>
      {error && <div className="text-xs text-admin-red mt-2">{error}</div>}
    </div>
  );
}
