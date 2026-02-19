"use client";

import { useState, useRef, useCallback } from "react";
import MarkerSVG from "./MarkerSVG";

type Conversation = {
  question: string;
  response: string;
};

interface AskTheOracleProps {
  initialConversations: Conversation[];
}

export default function AskTheOracle({ initialConversations }: AskTheOracleProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [question, setQuestion] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [delayWait, setDelayWait] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(
    async (skipDelay = false) => {
      const q = question.trim();
      if (!q || streaming) return;

      setStreaming(true);
      setCurrentResponse("");
      setDelayWait(null);

      try {
        abortRef.current = new AbortController();

        const res = await fetch("/api/oracle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, skipDelay }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setCurrentResponse(errData.error ?? "The Oracle is silent.");
          setConversations((prev) => [
            ...prev,
            { question: q, response: errData.error ?? "The Oracle is silent." },
          ]);
          setStreaming(false);
          setQuestion("");
          return;
        }

        const data = await res.json().catch(() => null);

        // Handle delay response
        if (data?.delayed) {
          setDelayWait(data.waitSeconds);
          setStreaming(false);
          // Wait then retry
          setTimeout(() => {
            setDelayWait(null);
            handleSubmit(true);
          }, data.waitSeconds * 1000);
          return;
        }

        // If not streaming SSE, handle as regular JSON (shouldn't happen but safety)
        if (data && !res.headers.get("content-type")?.includes("text/event-stream")) {
          setCurrentResponse(data.text ?? "");
          setConversations((prev) => [...prev, { question: q, response: data.text ?? "" }]);
          setStreaming(false);
          setQuestion("");
          return;
        }
      } catch {
        // Try streaming approach
      }

      // Stream SSE
      try {
        abortRef.current = new AbortController();
        const res = await fetch("/api/oracle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, skipDelay }),
          signal: abortRef.current.signal,
        });

        if (!res.body) {
          setStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.text) {
                fullText += parsed.text;
                setCurrentResponse(fullText);
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }

        setConversations((prev) => [...prev, { question: q, response: fullText }]);
        setCurrentResponse("");
        setQuestion("");
      } catch {
        // Aborted or errored
      }

      setStreaming(false);
    },
    [question, streaming]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <p
        style={{
          color: "rgba(200, 165, 75, 0.4)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "3px",
          marginBottom: "8px",
        }}
      >
        Ask the Oracle
      </p>

      {/* Conversation history */}
      {conversations.map((conv, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p
            style={{
              color: "rgba(200, 165, 75, 0.5)",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "14px",
              fontStyle: "italic",
            }}
          >
            {conv.question}
          </p>
          <p
            style={{
              color: "rgba(200, 165, 75, 0.8)",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "15px",
              fontStyle: "italic",
              lineHeight: 1.8,
              borderLeft: "2px solid rgba(200, 165, 75, 0.15)",
              paddingLeft: "16px",
            }}
          >
            {conv.response}
          </p>
        </div>
      ))}

      {/* Current streaming response */}
      {streaming && currentResponse && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p
            style={{
              color: "rgba(200, 165, 75, 0.5)",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "14px",
              fontStyle: "italic",
            }}
          >
            {question}
          </p>
          <p
            style={{
              color: "rgba(200, 165, 75, 0.8)",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "15px",
              fontStyle: "italic",
              lineHeight: 1.8,
              borderLeft: "2px solid rgba(200, 165, 75, 0.15)",
              paddingLeft: "16px",
            }}
          >
            {currentResponse}
          </p>
        </div>
      )}

      {/* Loading state */}
      {streaming && !currentResponse && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 0",
          }}
        >
          <MarkerSVG size={20} variant="gold" animated />
          <p
            style={{
              color: "rgba(200, 165, 75, 0.4)",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "13px",
              fontStyle: "italic",
            }}
          >
            {delayWait
              ? "The Oracle contemplates..."
              : "The Oracle speaks..."}
          </p>
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          placeholder="Ask a question..."
          disabled={streaming}
          style={{
            flex: 1,
            background: "transparent",
            border: "1px solid rgba(200, 165, 75, 0.2)",
            color: "rgba(200, 165, 75, 0.8)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "15px",
            fontStyle: "italic",
            padding: "12px 16px",
            outline: "none",
            minHeight: "44px",
          }}
        />
        <button
          onClick={() => handleSubmit()}
          disabled={streaming || !question.trim()}
          style={{
            background: "none",
            border: "1px solid rgba(200, 165, 75, 0.2)",
            color:
              streaming || !question.trim()
                ? "rgba(200, 165, 75, 0.2)"
                : "rgba(200, 165, 75, 0.6)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "14px",
            fontStyle: "italic",
            padding: "12px 20px",
            cursor: streaming || !question.trim() ? "default" : "pointer",
            minHeight: "44px",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          Ask
        </button>
      </div>
    </div>
  );
}
