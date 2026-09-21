"use client";

import { useState, useRef, useEffect } from "react";
import PageLayout from "../ui/PageLayout";
import HintSystem from "../ui/HintSystem";
import OrnateDivider from "@/components/ui/OrnateDivider";
import { colors, fontFamily, MIN_TAP_TARGET } from "@/components/ui/tokens";
import type { PassphraseEntryConfig } from "@/config";
import type { ShowcaseDefinition } from "@/components/showcase";

interface PassphraseEntryProps {
  config: PassphraseEntryConfig;
  onAdvance: () => void;
  revealedHintTiers?: number[];
  onHintReveal?: (tier: number) => Promise<void>;
}

export default function PassphraseEntry({
  config,
  onAdvance,
  revealedHintTiers,
  onHintReveal,
}: PassphraseEntryProps) {
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [shaking, setShaking] = useState(false);
  const [inputReady, setInputReady] = useState(false);
  const [hasText, setHasText] = useState(false);
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
      setHasText(false);
      setErrorMsg(
        config.error_message ?? "The Order does not recognize these words."
      );
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

  const submitLabel = config.submit_label ?? "Submit to the Order";
  const hints = config.hints ?? [];
  const showButton = hasText && status !== "success" && status !== "error";

  return (
    <PageLayout skipLabel="tap to skip" onComplete={() => setInputReady(true)}>
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
            status === "error" ? colors.gold50 : colors.gold40
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
        onInput={(e) => {
          setHasText((e.target as HTMLInputElement).value.length > 0);
        }}
        onFocus={(e) => {
          setTimeout(() => {
            e.target.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 300);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit((e.target as HTMLInputElement).value);
          }
        }}
      />

      {/* Submit button / error message occupy the same space */}
      <div
        style={{
          minHeight: MIN_TAP_TARGET,
          marginTop: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {errorMsg ? (
          <div
            style={{
              color: colors.gold55,
              fontFamily: fontFamily,
              fontSize: "14px",
              fontStyle: "italic",
              maxWidth: "300px",
              lineHeight: "1.6",
              textAlign: "center",
              animation: "fadeIn 0.4s ease",
            }}
          >
            {errorMsg}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) {
                handleSubmit(inputRef.current.value);
              }
            }}
            style={{
              background: "transparent",
              border: `1px solid ${colors.gold30}`,
              color: colors.gold70,
              fontFamily: fontFamily,
              fontSize: "14px",
              fontStyle: "italic",
              letterSpacing: "1.5px",
              padding: "10px 28px",
              minHeight: MIN_TAP_TARGET,
              cursor: "pointer",
              transition: "opacity 0.4s ease, border-color 0.3s ease",
              opacity: showButton ? 1 : 0,
              pointerEvents: showButton ? "auto" : "none",
            }}
          >
            {submitLabel}
          </button>
        )}
      </div>

      {hints.length > 0 && (
        <>
          <OrnateDivider
            style={{
              display: "block",
              opacity: 0.3,
              margin: "8px auto",
            }}
          />
          <HintSystem
            hints={hints}
            requestLabel="Request a Hint"
            loadingLabel="Revealing..."
            initialRevealedTiers={revealedHintTiers}
            onHintReveal={onHintReveal}
          />
        </>
      )}
    </PageLayout>
  );
}

export const showcase: ShowcaseDefinition<PassphraseEntryProps> = {
  category: "quest",
  label: "Passphrase Entry",
  description:
    "Text input puzzle for hidden acrostic passphrase with progressive hints",
  uses: ["PageLayout", "HintSystem", "OrnateDivider"],
  defaults: {
    config: {
      passphrase: "gilded",
      placeholder: "Speak the words.",
      error_message: "The Order does not recognize these words.",
      submit_label: "Submit to the Order",
      hints: [
        "The answer hides in plain sight within the letter.",
        "Read the first word of each paragraph carefully.",
      ],
    },
    onAdvance: () => {},
  },
};
