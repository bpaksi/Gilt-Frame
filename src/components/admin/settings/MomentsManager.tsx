"use client";

import { useState, useEffect } from "react";

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
    fetch("/api/admin/enroll") // We'll fetch moments from admin client directly
      .then(() => setLoading(false));

    // Fetch moments via inline approach since we don't have a dedicated API yet
    const fetchMoments = async () => {
      try {
        const res = await fetch("/api/admin/state?track=test");
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
      <div style={{ fontSize: "13px", color: "#999999", padding: "20px 0" }}>
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
            style={{
              background: "#fff",
              border: "1px solid #d0d0d0",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span style={{ fontSize: "13px", fontWeight: 500 }}>
                  {m.moment_type}
                </span>
                {m.chapter_id && (
                  <span style={{ fontSize: "11px", color: "#999999", marginLeft: "8px" }}>
                    {m.chapter_id}
                  </span>
                )}
              </div>
              <button
                onClick={() => copyShareLink(m.share_token, m.id)}
                style={{
                  height: "24px",
                  padding: "0 10px",
                  background: "#fff",
                  color: "#336699",
                  border: "1px solid #336699",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {copiedId === m.id ? "Copied!" : "Copy Link"}
              </button>
            </div>
            {m.narrative_text && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#333333",
                  marginTop: "6px",
                  lineHeight: 1.4,
                }}
              >
                {m.narrative_text}
              </div>
            )}
            <div style={{ fontSize: "10px", color: "#999999", marginTop: "4px" }}>
              {new Date(m.created_at).toLocaleDateString()}
            </div>
          </div>
        ))
      ) : (
        <div
          style={{
            background: "#fff",
            border: "1px solid #d0d0d0",
            borderRadius: "8px",
            padding: "20px 16px",
            textAlign: "center",
            fontSize: "13px",
            color: "#999999",
          }}
        >
          No snapshots captured yet. Snapshots are created as the user completes
          tasks.
        </div>
      )}
    </div>
  );
}
