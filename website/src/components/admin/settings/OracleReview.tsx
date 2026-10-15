"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin/fetch";

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
    adminFetch("/api/admin/oracle")
      .then((r) => r.json())
      .then((data) => {
        setConversations(data.conversations ?? []);
        setLoading(false);
      });
  }, []);

  async function toggleFlag(id: string, currentFlagged: boolean) {
    await adminFetch("/api/admin/oracle", {
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
      <div className="text-[13px] text-admin-text-faint py-5">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-4 text-xs text-admin-text-muted mb-4">
        <span>{conversations.length} conversations</span>
        <span>{totalTokens.toLocaleString()} tokens used</span>
        <span>
          {conversations.filter((c) => c.flagged).length} flagged
        </span>
      </div>

      {conversations.map((c) => (
        <div
          key={c.id}
          className={`rounded-lg py-3 px-4 mb-2 border transition-colors ${
            c.flagged
              ? "bg-red-50 border-red-200"
              : "bg-admin-card border-admin-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
          }`}
        >
          <div className="flex justify-between items-start mb-1.5">
            <div className="text-[13px] font-medium flex-1 text-admin-text-dark">
              Q: {c.question}
            </div>
            <button
              onClick={() => toggleFlag(c.id, c.flagged)}
              className="admin-focus bg-transparent border-none cursor-pointer text-sm px-1 shrink-0 rounded transition-opacity hover:opacity-70"
            >
              {c.flagged ? "\u{1F6A9}" : "\u2690"}
            </button>
          </div>
          <div className="text-xs text-admin-text leading-6 mb-1.5">
            A: {c.response.slice(0, 200)}
            {c.response.length > 200 ? "..." : ""}
          </div>
          <div className="text-[10px] text-admin-text-faint">
            {new Date(c.created_at).toLocaleString()}
            {c.tokens_used && ` \u2022 ${c.tokens_used} tokens`}
            {c.gemini_model && ` \u2022 ${c.gemini_model}`}
          </div>
        </div>
      ))}

      {conversations.length === 0 && (
        <div className="admin-card py-5 px-4 text-center text-[13px] text-admin-text-faint">
          No AI conversations yet.
        </div>
      )}
    </div>
  );
}
