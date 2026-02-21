"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import MarkerSVG from "./MarkerSVG";

type Conversation = {
  question: string;
  response: string;
  created_at: string;
};

interface AskTheOracleProps {
  onConversation: (conv: Conversation) => void;
}

export default function AskTheOracle({ onConversation }: AskTheOracleProps) {
  const [lastExchange, setLastExchange] = useState<Conversation | null>(null);
  const [question, setQuestion] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [delayWait, setDelayWait] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const handleSubmitRef = useRef<(skipDelay?: boolean) => void>(undefined);

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
          const errMsg = errData.error ?? "The Oracle is silent.";
          const conv = { question: q, response: errMsg, created_at: new Date().toISOString() };
          setLastExchange(conv);
          onConversation(conv);
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
            handleSubmitRef.current?.(true);
          }, data.waitSeconds * 1000);
          return;
        }

        // If not streaming SSE, handle as regular JSON
        if (data && !res.headers.get("content-type")?.includes("text/event-stream")) {
          const conv = { question: q, response: data.text ?? "", created_at: new Date().toISOString() };
          setLastExchange(conv);
          onConversation(conv);
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

        const conv = { question: q, response: fullText, created_at: new Date().toISOString() };
        setLastExchange(conv);
        onConversation(conv);
        setCurrentResponse("");
        setQuestion("");
      } catch {
        // Aborted or errored
      }

      setStreaming(false);
    },
    [question, streaming, onConversation]
  );

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

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
          color: "rgba(200, 165, 75, 0.3)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "13px",
          fontStyle: "italic",
          lineHeight: 1.7,
        }}
      >
        Speak freely, Sparrow. No question is unwelcome,
        though the Oracle answers only as it sees fit.
      </p>

      {/* Last completed exchange */}
      {!streaming && lastExchange && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p
            style={{
              color: "rgba(200, 165, 75, 0.5)",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "14px",
              fontStyle: "italic",
            }}
          >
            {lastExchange.question}
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
            {lastExchange.response}
          </p>
        </div>
      )}

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
