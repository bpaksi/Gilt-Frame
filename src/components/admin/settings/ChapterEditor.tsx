"use client";

import { chaptersConfig, getOrderedFlow } from "@/config/chapters";

export default function ChapterEditor() {
  const chapters = Object.entries(chaptersConfig.chapters);

  return (
    <div>
      {chapters.map(([id, chapter]) => {
        const flow = getOrderedFlow(chapter);
        return (
          <div
            key={id}
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 600 }}>
                  {chapter.name}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  {id} {chapter.location && `\u2022 ${chapter.location}`} {chapter.window && `\u2022 ${chapter.window}`}
                </div>
              </div>
              {chapter.companion && (
                <span
                  style={{
                    fontSize: "10px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontWeight: 600,
                  }}
                >
                  companion: {chapter.companion}
                </span>
              )}
            </div>

            {flow.length > 0 ? (
              <div style={{ fontSize: "12px", color: "#374151" }}>
                {flow.map((step, i) => (
                  <div
                    key={step.id}
                    style={{
                      padding: "4px 0",
                      borderTop: i > 0 ? "1px solid #f3f4f6" : "none",
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#9ca3af", width: "16px", textAlign: "right", fontSize: "10px" }}>
                      {step.order}
                    </span>
                    <span style={{ fontWeight: 500 }}>{step.name}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#9ca3af",
                        textTransform: "uppercase",
                      }}
                    >
                      {step.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "12px", color: "#9ca3af", fontStyle: "italic" }}>
                No flow steps configured yet.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
