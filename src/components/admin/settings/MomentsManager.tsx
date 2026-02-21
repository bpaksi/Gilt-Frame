"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin/fetch";

type Moment = {
  id: string;
  moment_type: string;
  chapter_id: string | null;
  narrative_text: string | null;
  share_token: string;
  created_at: string;
};

export default function MomentsManager() {
  const [moments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/enroll") // We'll fetch moments from admin client directly
      .then(() => setLoading(false));

    // Fetch moments via inline approach since we don't have a dedicated API yet
    const fetchMoments = async () => {
      try {
        const res = await adminFetch("/api/admin/state?track=test");
        if (res.ok) {
          // Moments don't have a dedicated API yet, show empty state
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };
    fetchMoments();
  }, []);

  async function copyShareLink(shareToken: string, id: string) {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/m/${shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return (
      <div className="text-[13px] text-admin-text-faint py-5">
        Loading...
      </div>
    );
  }

  return (
    <div>
      {moments.length > 0 ? (
        moments.map((m) => (
          <div
            key={m.id}
            className="admin-card py-3 px-4 mb-2"
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[13px] font-medium text-admin-text-dark">
                  {m.moment_type}
                </span>
                {m.chapter_id && (
                  <span className="text-[11px] text-admin-text-faint ml-2">
                    {m.chapter_id}
                  </span>
                )}
              </div>
              <button
                onClick={() => copyShareLink(m.share_token, m.id)}
                className="admin-btn admin-focus h-6 px-2.5 bg-admin-card text-admin-blue border border-admin-blue rounded text-[10px] font-semibold cursor-pointer font-inherit transition-colors duration-150 hover:bg-admin-blue hover:text-white"
              >
                {copiedId === m.id ? "Copied!" : "Copy Link"}
              </button>
            </div>
            {m.narrative_text && (
              <div className="text-xs text-admin-text mt-1.5 leading-snug">
                {m.narrative_text}
              </div>
            )}
            <div className="text-[10px] text-admin-text-faint mt-1">
              {new Date(m.created_at).toLocaleDateString()}
            </div>
          </div>
        ))
      ) : (
        <div className="admin-card py-5 px-4 text-center text-[13px] text-admin-text-faint">
          No snapshots captured yet. Snapshots are created as the user completes
          tasks.
        </div>
      )}
    </div>
  );
}
