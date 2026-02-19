"use client";

import { useState } from "react";

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
  const [to, setTo] = useState("sparrow");
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
      const res = await fetch("/api/admin/compose", {
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "36px",
    padding: "0 10px",
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
    fontSize: "13px",
    fontFamily: "inherit",
    background: "#fff",
    color: "#1a1a1a",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "12px 16px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "#6b7280",
          marginBottom: "10px",
        }}
      >
        Compose
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "8px",
          flexWrap: "wrap",
        }}
      >
        {/* Channel toggle */}
        <div
          style={{
            display: "flex",
            height: "32px",
            borderRadius: "4px",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          {(["sms", "email"] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              style={{
                padding: "0 12px",
                border: "none",
                background: channel === ch ? "#2563eb" : "#fff",
                color: channel === ch ? "#fff" : "#6b7280",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {ch}
            </button>
          ))}
        </div>

        {/* To field */}
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{ ...inputStyle, width: "auto", flex: 1, minWidth: "100px" }}
        >
          <option value="sparrow">Sparrow</option>
          <option value="bob">Bob</option>
          <option value="sister">Sister</option>
        </select>

        {/* Signature */}
        <select
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          style={{ ...inputStyle, width: "auto", flex: 1, minWidth: "120px" }}
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
          style={{ ...inputStyle, marginBottom: "8px" }}
        />
      )}

      <textarea
        placeholder="Message body..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        style={{
          ...inputStyle,
          height: "80px",
          padding: "8px 10px",
          resize: "vertical",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "8px",
        }}
      >
        <button
          onClick={handleSend}
          disabled={!body.trim() || sending}
          style={{
            height: "32px",
            padding: "0 16px",
            background:
              !body.trim() || sending ? "#93b5f5" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: !body.trim() || sending ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {sending ? "Sending..." : "SEND"}
        </button>
        {result && (
          <span style={{ fontSize: "12px", color: "#16a34a" }}>{result}</span>
        )}
        {error && (
          <span style={{ fontSize: "12px", color: "#dc2626" }}>{error}</span>
        )}
      </div>
    </div>
  );
}
