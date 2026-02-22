"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { adminFetch } from "@/lib/admin/fetch";
import type { Tables } from "@/lib/supabase/types";

type Enrollment = Tables<"device_enrollments">;

function enrollmentUrl(token: string): string {
  if (typeof window === "undefined") return `/e/${token}`;
  return `${window.location.origin}/e/${token}`;
}

function StatusBadge({ enrollment }: { enrollment: Enrollment }) {
  if (enrollment.enrolled_at) {
    return <span className="text-xs font-medium text-admin-green">Active</span>;
  }
  return <span className="text-xs font-medium text-admin-orange">Pending</span>;
}

export default function EnrollmentClient({
  initialEnrollments,
}: {
  initialEnrollments: Enrollment[];
}) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);
  const [track, setTrack] = useState<"test" | "live">("test");
  const [generating, setGenerating] = useState(false);
  const [newUrl, setNewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const active = (t: "test" | "live") =>
    enrollments.filter((e) => e.track === t && !!e.enrolled_at);

  async function generateLink() {
    setGenerating(true);
    setError("");
    setNewUrl(null);

    try {
      const res = await adminFetch("/api/admin/enroll", {
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

  async function deleteEnrollment(id: string) {
    const res = await adminFetch(`/api/admin/enroll/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEnrollments((prev) => prev.filter((e) => e.id !== id));
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {/* Capacity summary */}
      <div className="flex gap-6 mb-8 text-sm text-admin-text-muted">
        <span>Live: {active("live").length}/5 enrolled</span>
        <span>Test: {active("test").length}/5 enrolled</span>
      </div>

      {/* Generate form */}
      <div className="flex gap-3 items-center mb-6 flex-wrap">
        <select
          value={track}
          onChange={(e) => setTrack(e.target.value as "test" | "live")}
          className="admin-input admin-focus h-10 px-3 border border-admin-border rounded text-sm font-sans bg-admin-card text-admin-text outline-none w-[120px] transition-colors"
        >
          <option value="test">Test</option>
          <option value="live">Live</option>
        </select>
        <button
          onClick={generateLink}
          disabled={generating}
          className={`admin-btn admin-focus h-10 px-5 text-white border-none font-sans text-[13px] tracking-[1px] whitespace-nowrap rounded transition-colors duration-150 ${
            generating
              ? "bg-admin-blue-disabled cursor-not-allowed"
              : "bg-admin-blue hover:bg-admin-blue-hover cursor-pointer"
          }`}
        >
          {generating ? "Generating\u2026" : "Generate Link"}
        </button>
      </div>

      {error && (
        <p className="text-admin-red text-sm mb-4">{error}</p>
      )}

      {/* Newly generated link + QR */}
      {newUrl && (
        <div className="mb-6 py-4 px-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex gap-3 items-center flex-wrap mb-4">
            <span className="font-mono text-[13px] flex-1 break-all">{newUrl}</span>
            <button
              onClick={() => copyToClipboard(newUrl)}
              className="admin-btn admin-focus h-10 px-5 bg-admin-blue text-white border-none font-sans text-[13px] tracking-[1px] cursor-pointer whitespace-nowrap rounded transition-colors duration-150 hover:bg-admin-blue-hover"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="flex justify-center">
            <QRCodeSVG value={newUrl} size={160} />
          </div>
        </div>
      )}

      {/* Desktop table */}
      {enrollments.length > 0 && (
        <div className="hidden md:block admin-card overflow-hidden">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {["Track", "Status", "Device", "Type", "Enrolled", "Last Seen", "Agent", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left py-2.5 px-3 border-b border-admin-border font-normal tracking-[1px] text-admin-text-faint text-[11px] uppercase"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <React.Fragment key={e.id}>
                  <tr
                    className="border-b border-admin-border-light last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-medium">{e.track}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge enrollment={e} />
                    </td>
                    <td className="py-2.5 px-3 text-admin-text-muted">
                      {e.device_name ?? "\u2014"}
                    </td>
                    <td className="py-2.5 px-3 text-admin-text-muted capitalize">
                      {e.device_type ?? "\u2014"}
                    </td>
                    <td className="py-2.5 px-3">
                      {e.enrolled_at
                        ? new Date(e.enrolled_at).toLocaleDateString()
                        : "\u2014"}
                    </td>
                    <td className="py-2.5 px-3">
                      {e.last_seen
                        ? new Date(e.last_seen).toLocaleDateString()
                        : "\u2014"}
                    </td>
                    <td
                      className="py-2.5 px-3 max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap text-admin-text-muted"
                      title={e.user_agent ?? ""}
                    >
                      {e.user_agent ? e.user_agent.slice(0, 30) + "\u2026" : "\u2014"}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        {!e.enrolled_at && (
                          <button
                            onClick={() =>
                              setExpandedId(expandedId === e.id ? null : e.id)
                            }
                            className="admin-btn admin-focus bg-transparent border border-admin-border font-sans text-xs cursor-pointer py-1 px-2.5 rounded text-admin-text-muted transition-colors duration-150 hover:bg-gray-50 hover:border-gray-300"
                          >
                            {expandedId === e.id ? "Hide" : "View"}
                          </button>
                        )}
                        <button
                          onClick={() => deleteEnrollment(e.id)}
                          className="admin-btn admin-focus bg-transparent border border-admin-border font-sans text-xs cursor-pointer py-1 px-2.5 rounded text-admin-red transition-colors duration-150 hover:bg-red-50 hover:border-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === e.id && !e.enrolled_at && (
                    <tr className="bg-gray-50 border-b border-admin-border-light">
                      <td colSpan={8} className="py-4 px-4">
                        <div className="flex gap-6 items-start">
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-admin-text-faint uppercase tracking-[1px] mb-1">Enrollment URL</p>
                            <p className="font-mono text-[12px] break-all text-admin-text mb-3">
                              {enrollmentUrl(e.token)}
                            </p>
                            <button
                              onClick={() => copyToClipboard(enrollmentUrl(e.token))}
                              className="admin-btn admin-focus h-8 px-3 bg-admin-blue text-white border-none font-sans text-[11px] tracking-[1px] cursor-pointer whitespace-nowrap rounded transition-colors duration-150 hover:bg-admin-blue-hover"
                            >
                              {copied ? "Copied!" : "Copy URL"}
                            </button>
                          </div>
                          <div className="shrink-0">
                            <QRCodeSVG value={enrollmentUrl(e.token)} size={120} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {enrollments.length > 0 && (
        <div className="md:hidden flex flex-col gap-3">
          {enrollments.map((e) => (
            <div key={e.id} className="admin-card p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[1px] text-admin-text-faint">
                    {e.track}
                  </span>
                  <span className="ml-2">
                    <StatusBadge enrollment={e} />
                  </span>
                  {e.device_name && (
                    <div className="text-[11px] text-admin-text-muted mt-0.5">
                      {e.device_name}
                      {e.device_type && (
                        <span className="ml-1 capitalize">· {e.device_type}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {!e.enrolled_at && (
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === e.id ? null : e.id)
                      }
                      className="admin-btn admin-focus bg-transparent border border-admin-border font-sans text-[11px] cursor-pointer py-1 px-2 rounded text-admin-text-muted transition-colors duration-150 hover:bg-gray-50"
                    >
                      {expandedId === e.id ? "Hide" : "View"}
                    </button>
                  )}
                  <button
                    onClick={() => deleteEnrollment(e.id)}
                    className="admin-btn admin-focus bg-transparent border border-admin-border font-sans text-[11px] cursor-pointer py-1 px-2 rounded text-admin-red transition-colors duration-150 hover:bg-red-50 hover:border-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-admin-text-muted space-y-0.5">
                <div>
                  Enrolled:{" "}
                  {e.enrolled_at
                    ? new Date(e.enrolled_at).toLocaleDateString()
                    : "\u2014"}
                </div>
                <div>
                  Last seen:{" "}
                  {e.last_seen
                    ? new Date(e.last_seen).toLocaleDateString()
                    : "\u2014"}
                </div>
                {e.user_agent && (
                  <div className="truncate">
                    {e.user_agent.slice(0, 50)}
                    {e.user_agent.length > 50 ? "\u2026" : ""}
                  </div>
                )}
              </div>
              {expandedId === e.id && !e.enrolled_at && (
                <div className="mt-3 pt-3 border-t border-admin-border-light">
                  <p className="font-mono text-[11px] break-all text-admin-text mb-3">
                    {enrollmentUrl(e.token)}
                  </p>
                  <div className="flex gap-3 items-center flex-wrap">
                    <button
                      onClick={() => copyToClipboard(enrollmentUrl(e.token))}
                      className="admin-btn admin-focus h-8 px-3 bg-admin-blue text-white border-none font-sans text-[11px] tracking-[1px] cursor-pointer whitespace-nowrap rounded transition-colors duration-150 hover:bg-admin-blue-hover"
                    >
                      {copied ? "Copied!" : "Copy URL"}
                    </button>
                    <QRCodeSVG value={enrollmentUrl(e.token)} size={100} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {enrollments.length === 0 && (
        <p className="text-admin-text-faint text-sm">
          No enrollments yet. Generate a link above.
        </p>
      )}
    </div>
  );
}
