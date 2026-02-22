"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/fetch";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-admin-border" style={{ background: "#efede9" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#e68a00" }} />
      <span className="font-mono text-[9.5px] tracking-[2.5px] uppercase" style={{ color: "#9a7200" }}>
        {children}
      </span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function templateLabel(name: string): string {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function TestingClient({
  templates,
  testPlayerEmail,
  chapterId,
  chapterName,
}: {
  templates: string[];
  testPlayerEmail: string;
  chapterId: string;
  chapterName: string;
}) {
  const router = useRouter();

  // ── Email test state ──────────────────────────────────────────────────────
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0] ?? "");
  const [to, setTo] = useState(testPlayerEmail);
  const [subject, setSubject] = useState(
    templates[0] ? `Test - ${templateLabel(templates[0])}` : ""
  );
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<{ ok: boolean; message: string } | null>(null);

  function handleTemplateChange(name: string) {
    setSelectedTemplate(name);
    setSubject(`Test - ${templateLabel(name)}`);
    setEmailResult(null);
  }

  async function sendTestEmail() {
    setSendingEmail(true);
    setEmailResult(null);
    try {
      const res = await adminFetch("/api/admin/test/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: selectedTemplate, to, subject }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailResult({ ok: true, message: `Sent to ${to}` });
      } else {
        setEmailResult({ ok: false, message: data.error ?? "Failed to send." });
      }
    } catch {
      setEmailResult({ ok: false, message: "Network error." });
    } finally {
      setSendingEmail(false);
    }
  }

  // ── Data reset state ──────────────────────────────────────────────────────
  const [confirmAction, setConfirmAction] = useState<"reset" | "complete" | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  async function handleReset() {
    if (dataLoading) return;
    setDataLoading(true);
    setDataError("");
    try {
      const res = await adminFetch("/api/admin/chapter/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track: "test" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDataError(data.error ?? "Reset failed.");
      } else {
        setConfirmAction(null);
        router.refresh();
      }
    } catch {
      setDataError("Network error.");
    } finally {
      setDataLoading(false);
    }
  }

  async function handleComplete() {
    if (dataLoading) return;
    setDataLoading(true);
    setDataError("");
    try {
      const res = await adminFetch("/api/admin/chapter/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track: "test", chapterId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDataError(data.error ?? "Complete failed.");
      } else {
        setConfirmAction(null);
        router.refresh();
      }
    } catch {
      setDataError("Network error.");
    } finally {
      setDataLoading(false);
    }
  }

  const isReset = confirmAction === "reset";

  return (
    <div className="flex flex-col gap-8">

      {/* ── Send Test Email ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-admin-border overflow-hidden" style={{ background: "#f6f5f3" }}>
        <SectionHeader>Send Test Email</SectionHeader>

        <div className="px-4 py-4 flex flex-col gap-3">
          {/* Template */}
          <div>
            <label className="block text-[11px] uppercase tracking-[1px] text-admin-text-faint mb-1">
              Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="admin-input admin-focus w-full h-10 px-3 border border-admin-border rounded text-sm font-sans bg-admin-card text-admin-text outline-none transition-colors"
            >
              {templates.map((t) => (
                <option key={t} value={t}>
                  {templateLabel(t)}
                </option>
              ))}
            </select>
          </div>

          {/* To */}
          <div>
            <label className="block text-[11px] uppercase tracking-[1px] text-admin-text-faint mb-1">
              To
            </label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="admin-input admin-focus w-full h-10 px-3 border border-admin-border rounded text-sm font-sans bg-admin-card text-admin-text outline-none transition-colors"
              placeholder="email@example.com"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] uppercase tracking-[1px] text-admin-text-faint mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="admin-input admin-focus w-full h-10 px-3 border border-admin-border rounded text-sm font-sans bg-admin-card text-admin-text outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={sendTestEmail}
              disabled={sendingEmail || !selectedTemplate || !to}
              className={`admin-btn admin-focus h-10 px-5 text-white border-none font-sans text-[13px] tracking-[1px] whitespace-nowrap rounded transition-colors duration-150 ${
                sendingEmail || !selectedTemplate || !to
                  ? "bg-admin-blue-disabled cursor-not-allowed"
                  : "bg-admin-blue hover:bg-admin-blue-hover cursor-pointer"
              }`}
            >
              {sendingEmail ? "Sending\u2026" : "Send"}
            </button>
            {emailResult && (
              <span className={`text-[13px] ${emailResult.ok ? "text-admin-green" : "text-admin-red"}`}>
                {emailResult.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Test Data ───────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-admin-border overflow-hidden" style={{ background: "#f6f5f3" }}>
        <SectionHeader>Test Data</SectionHeader>

        {confirmAction ? (
          <div className="px-4 py-4">
            <p className={`text-[13px] leading-relaxed mb-3 ${isReset ? "text-admin-red" : "text-admin-text"}`}>
              {isReset
                ? "Purge all test track data? This wipes all chapters, messages, answers, activity, moments, and oracle history."
                : `Mark "${chapterName}" as complete? This adds completed step rows for all remaining steps and marks the chapter done.`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={isReset ? handleReset : handleComplete}
                disabled={dataLoading}
                className={`admin-btn admin-focus h-8 px-4 text-white border-none rounded-md text-xs font-semibold font-inherit transition-colors duration-150 ${
                  dataLoading
                    ? isReset ? "bg-red-300 cursor-not-allowed" : "bg-blue-300 cursor-not-allowed"
                    : isReset
                    ? "bg-admin-red hover:bg-admin-red-hover cursor-pointer"
                    : "bg-admin-blue hover:bg-admin-blue-hover cursor-pointer"
                }`}
              >
                {dataLoading ? "Processing..." : "Confirm"}
              </button>
              <button
                onClick={() => { setConfirmAction(null); setDataError(""); }}
                className="admin-focus h-8 px-4 bg-admin-card text-admin-text-muted border border-admin-border rounded-md text-xs cursor-pointer font-inherit transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
            {dataError && <p className="text-xs text-admin-red mt-2">{dataError}</p>}
          </div>
        ) : (
          <div className="divide-y divide-admin-border">
            <button
              onClick={() => setConfirmAction("complete")}
              className="admin-focus w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer group transition-colors duration-150 hover:bg-white/70 border-none bg-transparent font-inherit"
            >
              <span
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-admin-blue transition-colors duration-150 group-hover:bg-white"
                style={{ background: "rgba(51,102,153,0.10)" }}
              >
                <CheckIcon />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-admin-text-dark">Complete Chapter</div>
                <div className="text-[11px] text-admin-text-faint mt-0.5 truncate">{chapterName}</div>
              </div>
              <span className="text-admin-text-faint text-[13px] opacity-0 group-hover:opacity-100 transition-opacity duration-150">→</span>
            </button>

            <button
              onClick={() => setConfirmAction("reset")}
              className="admin-focus w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer group transition-colors duration-150 hover:bg-white/70 border-none bg-transparent font-inherit"
            >
              <span
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-admin-red transition-colors duration-150 group-hover:bg-white"
                style={{ background: "rgba(198,40,40,0.09)" }}
              >
                <TrashIcon />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-admin-text-dark">Reset All Data</div>
                <div className="text-[11px] text-admin-text-faint mt-0.5">Wipe all test track data</div>
              </div>
              <span className="text-admin-text-faint text-[13px] opacity-0 group-hover:opacity-100 transition-opacity duration-150">→</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
