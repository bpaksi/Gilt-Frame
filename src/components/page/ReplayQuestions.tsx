"use client";

import { colors, fontFamily } from "@/components/ui/tokens";
import type { QAReplay } from "@/config";

interface ReplayQuestionsProps {
  questions: QAReplay[];
}

export default function ReplayQuestions({ questions }: ReplayQuestionsProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
        maxWidth: "340px",
      }}
    >
      {questions.map((q, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            padding: "16px",
            border: `1px solid ${colors.gold12}`,
            borderRadius: "2px",
          }}
        >
          {/* Question */}
          <p
            style={{
              color: colors.gold70,
              fontFamily,
              fontSize: "14px",
              fontStyle: "italic",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {q.question}
          </p>

          {/* Player's answer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: q.correct
                  ? colors.gold60
                  : colors.errorRed50,
                flexShrink: 0,
              }}
            />
            <p
              style={{
                color: q.correct ? colors.gold80 : colors.gold50,
                fontFamily,
                fontSize: "14px",
                margin: 0,
                textDecoration: q.correct ? "none" : "line-through",
                textDecorationColor: colors.errorRed50,
              }}
            >
              {q.selected}
            </p>
          </div>

          {/* Correct answer (only show if wrong) */}
          {!q.correct && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: colors.gold60,
                  flexShrink: 0,
                }}
              />
              <p
                style={{
                  color: colors.gold80,
                  fontFamily,
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                {q.correct_answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
