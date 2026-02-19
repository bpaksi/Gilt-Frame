"use client";

import { useState, useEffect } from "react";

type Conversation = {
  id: string;
  question: string;
  response: string;
  flagged: boolean;
  tokens_used: number | null;
  gemini_model: string | null;
  created_at: string;
};

export default function OracleReview() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/oracle")
      .then((r) => r.json())
      .then((data) => {
        setConversations(data.conversations ?? []);
        setLoading(false);
      });
  }, []);

  async function toggleFlag(id: string, currentFlagged: boolean) {
    await fetch("/api/admin/oracle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, flagged: !currentFlagged }),
    });
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, flagged: !currentFlagged } : c
      )
    );
  }

  const totalTokens = conversations.reduce(
    (sum, c) => sum + (c.tokens_used ?? 0),
    0
  );

  if (loading) {
    return (
      <div style={{ fontSize: "13px", color: "#9ca3af", padding: "20px 0" }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "16px",
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "16px",
        }}
      >
        <span>{conversations.length} conversations</span>
        <span>{totalTokens.toLocaleString()} tokens used</span>
        <span>
          {conversations.filter((c) => c.flagged).length} flagged
        </span>
      </div>

      {conversations.map((c) => (
        <div
          key={c.id}
          style={{
            background: c.flagged ? "#fef2f2" : "#fff",
            border: `1px solid ${c.flagged ? "#fecaca" : "#e5e7eb"}`,
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "6px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 500, flex: 1 }}>
              Q: {c.question}
            </div>
            <button
              onClick={() => toggleFlag(c.id, c.flagged)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                padding: "0 4px",
                flexShrink: 0,
              }}
            >
              {c.flagged ? "\u{1F6A9}" : "\u2690"}
            </button>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#374151",
              lineHeight: 1.5,
              marginBottom: "6px",
            }}
          >
            A: {c.response.slice(0, 200)}
            {c.response.length > 200 ? "..." : ""}
          </div>
          <div style={{ fontSize: "10px", color: "#9ca3af" }}>
            {new Date(c.created_at).toLocaleString()}
            {c.tokens_used && ` \u2022 ${c.tokens_used} tokens`}
            {c.gemini_model && ` \u2022 ${c.gemini_model}`}
          </div>
        </div>
      ))}

      {conversations.length === 0 && (
        <div style={{ fontSize: "13px", color: "#9ca3af" }}>
          No oracle conversations yet.
        </div>
      )}
    </div>
  );
}
