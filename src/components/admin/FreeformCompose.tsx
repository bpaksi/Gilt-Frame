"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/admin/fetch";

const SIGNATURES: { label: string; value: string }[] = [
  { label: "The Registrar", value: "\n\n\u2014 The Registrar" },
  { label: "The Archivist", value: "\n\n\u2014 The Archivist" },
  { label: "The Council", value: "\n\n\u2014 The Council" },
  { label: "None", value: "" },
];

export default function FreeformCompose({
  track,
}: {
  track: "test" | "live";
}) {
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const [to, setTo] = useState("player");
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("");
  const [signature, setSignature] = useState(SIGNATURES[0].value);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSend() {
    if (!body.trim() || sending) return;
    setSending(true);
    setError("");
    setResult(null);

    try {
      const res = await adminFetch("/api/admin/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          channel,
          to,
          body: body + signature,
          subject: channel === "email" ? subject : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Send failed.");
      } else {
        setResult("Sent!");
        setBody("");
        setSubject("");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="admin-card py-3 px-4 mb-4">
      <div className="text-[11px] font-semibold tracking-[1.5px] uppercase text-admin-text-muted mb-2.5">
        Compose
      </div>

      <div className="flex gap-2 mb-2 flex-wrap">
        {/* Channel toggle */}
        <div className="flex h-8 rounded border border-admin-border overflow-hidden">
          {(["sms", "email"] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              className={`admin-focus px-3 border-none text-[11px] font-semibold tracking-[0.5px] uppercase cursor-pointer font-inherit transition-colors duration-150 ${
                channel === ch
                  ? "bg-admin-blue text-white"
                  : "bg-admin-card text-admin-text-muted hover:bg-gray-100"
              }`}
            >
              {ch}
            </button>
          ))}
        </div>

        {/* To field */}
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="admin-input admin-focus h-9 px-2.5 border border-admin-border rounded text-[13px] font-inherit bg-admin-card text-admin-text outline-none flex-1 min-w-[100px] transition-colors"
        >
          <option value="player">Player</option>
          <option value="companion1">Companion 1</option>
          <option value="companion2">Companion 2</option>
        </select>

        {/* Signature */}
        <select
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          className="admin-input admin-focus h-9 px-2.5 border border-admin-border rounded text-[13px] font-inherit bg-admin-card text-admin-text outline-none flex-1 min-w-[120px] transition-colors"
        >
          {SIGNATURES.map((s) => (
            <option key={s.label} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {channel === "email" && (
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="admin-input admin-focus w-full h-9 px-2.5 border border-admin-border rounded text-[13px] font-inherit bg-admin-card text-admin-text outline-none mb-2 transition-colors"
        />
      )}

      <textarea
        placeholder="Message body..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="admin-input admin-focus w-full h-20 py-2 px-2.5 border border-admin-border rounded text-[13px] font-inherit bg-admin-card text-admin-text outline-none resize-y transition-colors"
      />

      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={handleSend}
          disabled={!body.trim() || sending}
          className={`admin-btn admin-focus h-8 px-4 text-white border-none rounded text-xs font-semibold font-inherit transition-colors duration-150 ${
            !body.trim() || sending
              ? "bg-admin-blue-disabled cursor-not-allowed"
              : "bg-admin-blue hover:bg-admin-blue-hover cursor-pointer"
          }`}
        >
          {sending ? "Sending..." : "SEND"}
        </button>
        {result && (
          <span className="text-xs text-admin-green">{result}</span>
        )}
        {error && (
          <span className="text-xs text-admin-red">{error}</span>
        )}
      </div>
    </div>
  );
}
