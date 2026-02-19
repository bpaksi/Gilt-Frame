"use client";

import { gameConfig, getOrderedSteps } from "@/config/chapters";

export default function ChapterEditor() {
  const chapters = Object.entries(gameConfig.chapters);

  return (
    <div>
      {chapters.map(([id, chapter]) => {
        const steps = getOrderedSteps(chapter);
        return (
          <div
            key={id}
            style={{
              background: "#fff",
              border: "1px solid #d0d0d0",
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
                <div style={{ fontSize: "12px", color: "#666666" }}>
                  {id} {chapter.location && `\u2022 ${chapter.location}`} {chapter.window && `\u2022 ${chapter.window}`}
                </div>
              </div>
              {chapter.companion && (
                <span
                  style={{
                    fontSize: "10px",
                    background: "#e8eef5",
                    color: "#336699",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontWeight: 600,
                  }}
                >
                  auto: {chapter.companion}
                </span>
              )}
            </div>

            {steps.length > 0 ? (
              <div style={{ fontSize: "12px", color: "#333333" }}>
                {steps.map((step, i) => (
                  <div
                    key={step.id}
                    style={{
                      padding: "4px 0",
                      borderTop: i > 0 ? "1px solid #e8e8e8" : "none",
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#999999", width: "16px", textAlign: "right", fontSize: "10px" }}>
                      {step.order}
                    </span>
                    <span style={{ fontWeight: 500 }}>{step.name}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#999999",
                        textTransform: "uppercase",
                      }}
                    >
                      {step.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "12px", color: "#999999", fontStyle: "italic" }}>
                No steps configured yet.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
