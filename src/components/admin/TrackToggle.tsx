"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch } from "@/lib/admin/fetch";

export default function TrackToggle({
  initialTrack,
}: {
  initialTrack: "test" | "live";
}) {
  const router = useRouter();
  const [track, setTrack] = useState(initialTrack);
  const [switching, setSwitching] = useState(false);

  async function handleSwitch(newTrack: "test" | "live") {
    if (newTrack === track || switching) return;
    setSwitching(true);

    await adminFetch("/api/admin/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ track: newTrack }),
    });

    setTrack(newTrack);
    setSwitching(false);
    router.refresh();
  }

  return (
    <div className="flex w-40 h-8 rounded-md border border-white/15 overflow-hidden bg-white/8">
      <button
        onClick={() => handleSwitch("test")}
        className={`admin-focus flex-1 h-8 flex items-center justify-center text-[11px] font-bold tracking-[1.5px] uppercase border-none transition-all duration-200 font-sans ${
          track === "test"
            ? "bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
            : "bg-transparent text-white/50 hover:text-white/70 hover:bg-white/5"
        } ${switching ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
      >
        Test
      </button>
      <button
        onClick={() => handleSwitch("live")}
        className={`admin-focus flex-1 h-8 flex items-center justify-center text-[11px] font-bold tracking-[1.5px] uppercase border-none transition-all duration-200 font-sans ${
          track === "live"
            ? "bg-admin-red text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
            : "bg-transparent text-white/50 hover:text-white/70 hover:bg-white/5"
        } ${switching ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
      >
        Live
      </button>
    </div>
  );
}
