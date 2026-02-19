"use client";

import { useState } from "react";
import type { Tables } from "@/lib/supabase/types";

type Enrollment = Tables<"device_enrollments">;

export default function EnrollmentClient({
  initialEnrollments,
}: {
  initialEnrollments: Enrollment[];
}) {
  const [enrollments, setEnrollments] =
    useState<Enrollment[]>(initialEnrollments);
  const [track, setTrack] = useState<"test" | "live">("test");
  const [generating, setGenerating] = useState(false);
  const [newUrl, setNewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const active = (t: "test" | "live") =>
    enrollments.filter((e) => e.track === t && !e.revoked);

  async function generateLink() {
    setGenerating(true);
    setError("");
    setNewUrl(null);

    try {
      const res = await fetch("/api/admin/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to generate link.");
        return;
      }

      setNewUrl(data.url);
      setEnrollments((prev) => [data.enrollment, ...prev]);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setGenerating(false);
    }
  }

  async function revokeEnrollment(id: string) {
    const res = await fetch(`/api/admin/enroll/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEnrollments((prev) =>
        prev.map((e) => (e.id === id ? { ...e, revoked: true } : e))
      );
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputStyle: React.CSSProperties = {
    height: "40px",
    padding: "0 12px",
    border: "1px solid #ddd",
    fontSize: "14px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: "#fff",
    color: "#1a1a1a",
    outline: "none",
  };

  const btnStyle = (disabled?: boolean): React.CSSProperties => ({
    height: "40px",
    padding: "0 20px",
    background: disabled ? "#93b5f5" : "#2563eb",
    color: "#fafafa",
    border: "none",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "13px",
    letterSpacing: "1px",
    cursor: disabled ? "not-allowed" : "pointer",
    whiteSpace: "nowrap",
  });

  return (
    <div>
      {/* Capacity summary */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          marginBottom: "32px",
          fontSize: "14px",
          color: "#555",
        }}
      >
        <span>Live: {active("live").length}/5 enrolled</span>
        <span>Test: {active("test").length}/5 enrolled</span>
      </div>

      {/* Generate form */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <select
          value={track}
          onChange={(e) => setTrack(e.target.value as "test" | "live")}
          style={{ ...inputStyle, width: "120px" }}
        >
          <option value="test">Test</option>
          <option value="live">Live</option>
        </select>
        <button
          onClick={generateLink}
          disabled={generating}
          style={btnStyle(generating)}
        >
          {generating ? "Generating…" : "Generate Link"}
        </button>
      </div>

      {error && (
        <p style={{ color: "#c0392b", fontSize: "14px", marginBottom: "16px" }}>
          {error}
        </p>
      )}

      {newUrl && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            marginBottom: "24px",
            padding: "12px 16px",
            background: "#f0f8f0",
            border: "1px solid #c3e6cb",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "13px",
              flex: 1,
              wordBreak: "break-all",
            }}
          >
            {newUrl}
          </span>
          <button
            onClick={() => copyToClipboard(newUrl)}
            style={btnStyle()}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {/* Enrollments table */}
      {enrollments.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr>
              {["Track", "Status", "Enrolled", "Last Seen", "Agent", ""].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      borderBottom: "1px solid #ddd",
                      fontWeight: 400,
                      letterSpacing: "1px",
                      color: "#888",
                      fontSize: "11px",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr
                key={e.id}
                style={{
                  opacity: e.revoked ? 0.4 : 1,
                  borderBottom: "1px solid #eee",
                }}
              >
                <td style={{ padding: "10px 12px" }}>{e.track}</td>
                <td style={{ padding: "10px 12px" }}>
                  {e.revoked
                    ? "Revoked"
                    : e.enrolled_at
                    ? "Active"
                    : "Pending"}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {e.enrolled_at
                    ? new Date(e.enrolled_at).toLocaleDateString()
                    : "—"}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {e.last_seen
                    ? new Date(e.last_seen).toLocaleDateString()
                    : "—"}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "#666",
                  }}
                  title={e.user_agent ?? ""}
                >
                  {e.user_agent ? e.user_agent.slice(0, 40) + "…" : "—"}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {!e.revoked && (
                    <button
                      onClick={() => revokeEnrollment(e.id)}
                      style={{
                        background: "none",
                        border: "1px solid #ddd",
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontSize: "12px",
                        cursor: "pointer",
                        padding: "4px 10px",
                        color: "#c0392b",
                      }}
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {enrollments.length === 0 && (
        <p style={{ color: "#888", fontSize: "14px" }}>
          No enrollments yet. Generate a link above.
        </p>
      )}
    </div>
  );
}
