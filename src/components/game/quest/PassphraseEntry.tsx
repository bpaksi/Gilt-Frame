"use client";

import { useState, useRef, useEffect } from "react";
import GiltFrame from "../GiltFrame";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { PassphraseEntryConfig } from "@/config";
import type { ShowcaseDefinition } from "@/components/showcase";

interface PassphraseEntryProps {
  config: PassphraseEntryConfig;
  onAdvance: () => void;
  validatePassphraseAction?: (passphrase: string) => Promise<{ success: boolean; error?: string }>;
}

export default function PassphraseEntry({
  config,
  onAdvance,
  validatePassphraseAction,
}: PassphraseEntryProps) {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "error" | "success"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [shaking, setShaking] = useState(false);
  const [inputReady, setInputReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputReady) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputReady]);

  async function handleSubmit(passphrase: string) {
    if (!passphrase.trim() || status === "submitting") return;

    setStatus("submitting");
    setErrorMsg("");

    let success: boolean;
    let errorText: string | undefined;

    if (validatePassphraseAction) {
      const result = await validatePassphraseAction(passphrase);
      success = result.success;
      errorText = result.error;
    } else {
      const res = await fetch("/api/auth/passphrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });
      success = res.ok;
      if (!success) {
        const data = await res.json();
        errorText = data.error;
      }
    }

    if (success) {
      setStatus("success");
      setTimeout(() => onAdvance(), 800);
    } else {
      setStatus("error");
      setShaking(true);
      setErrorMsg(errorText || "You have not been summoned.");
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

  return (
    <GiltFrame onAnimationComplete={() => setInputReady(true)}>
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        spellCheck={false}
        placeholder={config.placeholder ?? "Speak the words."}
        disabled={status === "submitting" || status === "success"}
        className={shaking ? "shake" : ""}
        style={{
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${
            status === "error"
              ? colors.gold50
              : colors.gold40
          }`,
          color: colors.gold,
          fontFamily: fontFamily,
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
          color: colors.gold55,
          fontFamily: fontFamily,
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
    </GiltFrame>
  );
}

export const showcase: ShowcaseDefinition<PassphraseEntryProps> = {
  category: "quest",
  label: "Passphrase Entry",
  description: "Text input puzzle for hidden acrostic passphrase",
  uses: ["GiltFrame"],
  defaults: {
    config: {
      passphrase: "gilded",
      placeholder: "Speak the words.",
    },
    onAdvance: () => {},
    validatePassphraseAction: async (p: string) => ({ success: p === "gilded" }),
  },
};
