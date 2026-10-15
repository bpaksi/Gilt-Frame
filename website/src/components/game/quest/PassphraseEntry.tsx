"use client";

import { useState, useRef, useEffect, type CSSProperties } from "react";
import PageLayout from "../ui/PageLayout";
import HintSystem from "../ui/HintSystem";
import OrnateDivider from "@/components/ui/OrnateDivider";
import { candle, fontDisplay, fontText, MIN_TAP_TARGET } from "@/components/ui/tokens";
import { fontVariables } from "@/components/ui/fonts";
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
      setHasText(false);
      setErrorMsg(
        config.error_message ?? "The Order does not recognize these words."
      );
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

  const submitLabel = config.submit_label ?? "Speak it";
  const hints = config.hints ?? [];
  const showButton = hasText && status !== "success" && status !== "error";
  const placeholder = config.placeholder ?? "Speak the words.";
  // Per-puzzle key for the "intro already seen" flag. Derived from the hint
  // text (never the passphrase) so the answer isn't written to storage.
  const introKey = `passphrase:${hashKey(
    `${placeholder}|${hints.join("|")}`
  )}`;

  return (
    <PageLayout
      skipLabel="tap to skip"
      introKey={introKey}
      onComplete={() => setInputReady(true)}
    >
      <div
        className={fontVariables}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div
          className={`gilt-well ${status === "error" ? "withdraw" : ""}`}
          data-state={status}
          style={{
            width: "min(320px, calc(100vw - 48px))",
            padding: "14px 16px",
          }}
        >
          <GiltCorners />
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            aria-label={placeholder}
            aria-describedby="passphrase-status"
            placeholder={placeholder}
            disabled={status === "success"}
            className="gilt-well__input"
            style={{
              display: "block",
              width: "100%",
              background: "transparent",
              border: "none",
              color: status === "success" ? candle.giltHi : candle.ink,
              fontFamily: fontDisplay,
              fontWeight: 300,
              fontStyle: "italic",
              // >=16px keeps iOS Safari from zooming on focus
              fontSize: "24px",
              lineHeight: 1.2,
              letterSpacing: "0.02em",
              textAlign: "center",
              padding: "6px 4px",
              minHeight: MIN_TAP_TARGET,
              outline: "none",
              transition: "color 0.6s ease",
            }}
            onInput={(e) => {
              setHasText((e.target as HTMLInputElement).value.length > 0);
            }}
            onFocus={(e) => {
              const reduce = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
              ).matches;
              setTimeout(() => {
                e.target.scrollIntoView({
                  behavior: reduce ? "auto" : "smooth",
                  block: "center",
                });
              }, 300);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit((e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>

        {/* Submit button / error message occupy the same space */}
        <div
          id="passphrase-status"
          aria-live="polite"
          style={{
            minHeight: MIN_TAP_TARGET,
            marginTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {errorMsg ? (
            <p
              className="gilt-fade"
              style={{
                margin: 0,
                color: candle.inkDim,
                fontFamily: fontText,
                fontSize: "16px",
                fontStyle: "italic",
                maxWidth: "300px",
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              {errorMsg}
            </p>
          ) : (
            <button
              type="button"
              className="gilt-cta"
              aria-hidden={!showButton}
              tabIndex={showButton ? 0 : -1}
              onClick={() => {
                if (inputRef.current) {
                  handleSubmit(inputRef.current.value);
                }
              }}
              style={{
                background: "transparent",
                border: `1px solid ${candle.giltDeep}`,
                color: candle.gilt,
                fontFamily: fontText,
                fontSize: "16px",
                fontVariant: "all-small-caps",
                letterSpacing: "0.3em",
                padding: "8px 24px 10px",
                minHeight: MIN_TAP_TARGET,
                cursor: "pointer",
                transition:
                  "opacity 0.4s ease, border-color 0.3s ease, color 0.3s ease",
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
      </div>
    </PageLayout>
  );
}

/** Tiny non-cryptographic string hash (djb2) for storage keys. */
function hashKey(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = (h * 33) ^ input.charCodeAt(i);
  return (h >>> 0).toString(36);
}

/** Small gilt lozenge pips at the four corners of the well (SVG, no raster). */
function GiltCorners() {
  const pip = (pos: CSSProperties) => (
    <svg
      aria-hidden="true"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      style={{ position: "absolute", ...pos }}
    >
      <path d="M5 0 L10 5 L5 10 L0 5 Z" fill={candle.giltDeep} />
      <circle cx="5" cy="5" r="1.4" fill={candle.giltHi} />
    </svg>
  );
  return (
    <>
      {pip({ top: -6, left: -6 })}
      {pip({ top: -6, right: -6 })}
      {pip({ bottom: -6, left: -6 })}
      {pip({ bottom: -6, right: -6 })}
    </>
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
      submit_label: "Speak it",
      hints: [
        "The answer hides in plain sight within the letter.",
        "Read the first word of each paragraph carefully.",
      ],
    },
    onAdvance: () => {},
  },
};
