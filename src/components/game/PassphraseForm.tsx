"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PassphraseFormProps {
  visible: boolean;
  hasDeviceToken: boolean;
}

export default function PassphraseForm({ visible, hasDeviceToken }: PassphraseFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (visible && hasDeviceToken && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible, hasDeviceToken]);

  async function handleSubmit(passphrase: string) {
    if (!passphrase.trim() || status === "submitting") return;

    setStatus("submitting");
    setErrorMsg("");

    const res = await fetch("/api/auth/passphrase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase }),
    });

    if (res.ok) {
      setStatus("success");
      setTimeout(() => router.push("/current"), 800);
    } else {
      const data = await res.json();
      setStatus("error");
      setShaking(true);
      setErrorMsg(data.error || "You have not been summoned.");
      setTimeout(() => setShaking(false), 400);
      setTimeout(() => {
        setErrorMsg("");
        setStatus("idle");
      }, 3000);
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.focus();
      }
    }
  }

  const containerStyle: React.CSSProperties = {
    marginTop: "60px",
    textAlign: "center",
    opacity: visible ? 1 : 0,
    transition: "opacity 2s ease",
    pointerEvents: visible ? "auto" : "none",
  };

  if (!hasDeviceToken) {
    return (
      <div style={containerStyle}>
        <p
          style={{
            color: "rgba(200, 165, 75, 0.35)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "16px",
            fontStyle: "italic",
            letterSpacing: "1px",
          }}
        >
          You are not the one.
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        spellCheck={false}
        placeholder="Speak the words."
        disabled={status === "submitting" || status === "success"}
        className={shaking ? "shake" : ""}
        style={{
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${status === "error" ? "rgba(200, 165, 75, 0.5)" : "rgba(200, 165, 75, 0.3)"}`,
          color: "#C8A54B",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "18px",
          fontStyle: "italic",
          letterSpacing: "2px",
          textAlign: "center",
          padding: "12px 20px",
          width: "280px",
          height: "48px",
          outline: "none",
          transition: "border-color 0.4s ease",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit((e.target as HTMLInputElement).value);
          }
        }}
      />
      <div
        style={{
          color: "rgba(200, 165, 75, 0.4)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "14px",
          fontStyle: "italic",
          marginTop: "20px",
          minHeight: "40px",
          opacity: errorMsg ? 1 : 0,
          transition: "opacity 0.6s ease",
          maxWidth: "300px",
          margin: "20px auto 0",
          lineHeight: "1.6",
        }}
      >
        {errorMsg}
      </div>
    </div>
  );
}
