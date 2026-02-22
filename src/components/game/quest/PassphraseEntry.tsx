"use client";

import { useState, useRef, useEffect } from "react";
import PageLayout from "../PageLayout";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { PassphraseEntryConfig } from "@/config";
import type { ShowcaseDefinition } from "@/components/showcase";

interface PassphraseEntryProps {
  config: PassphraseEntryConfig;
  onAdvance: () => void;
}

export default function PassphraseEntry({ config, onAdvance }: PassphraseEntryProps) {
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [shaking, setShaking] = useState(false);
  const [inputReady, setInputReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputReady) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputReady]);

  function handleSubmit(passphrase: string) {
    if (!passphrase.trim() || status === "success") return;

    const correct =
      passphrase.trim().toUpperCase() === config.passphrase.toUpperCase();

    if (correct) {
      setStatus("success");
      setTimeout(() => onAdvance(), 800);
    } else {
      setStatus("error");
      setShaking(true);
      setErrorMsg("You have not been summoned.");
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
    <PageLayout onComplete={() => setInputReady(true)}>
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        spellCheck={false}
        placeholder={config.placeholder ?? "Speak the words."}
        disabled={status === "success"}
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
    </PageLayout>
  );
}

export const showcase: ShowcaseDefinition<PassphraseEntryProps> = {
  category: "quest",
  label: "Passphrase Entry",
  description: "Text input puzzle for hidden acrostic passphrase",
  uses: ["PageLayout"],
  defaults: {
    config: {
      passphrase: "gilded",
      placeholder: "Speak the words.",
    },
    onAdvance: () => {},
  },
};
