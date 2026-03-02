"use client";

import { useState, type FormEvent } from "react";
import GoldText from "@/components/ui/GoldText";
import OrnateDivider from "@/components/ui/OrnateDivider";
import GhostButton from "@/components/ui/GhostButton";
import { colors, fontFamily } from "@/components/ui/tokens";

type FormState = "idle" | "submitting" | "success" | "already-subscribed" | "error" | "rate-limited";

const inputStyle = {
  background: "transparent",
  border: `1px solid ${colors.gold30}`,
  color: colors.gold90,
  fontFamily,
  fontSize: "16px",
  fontStyle: "italic" as const,
  padding: "12px 16px",
  width: "100%",
  outline: "none",
  borderRadius: 0,
};

export default function JoinForm() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!consent || !phone.trim()) return;

    setState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), name: name.trim() || undefined, consent }),
      });

      if (res.status === 429) {
        setState("rate-limited");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setErrorMsg(data.error ?? "Something went wrong.");
        return;
      }

      if (data.alreadySubscribed) {
        setState("already-subscribed");
        return;
      }

      setState("success");
    } catch {
      setState("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <GoldText variant="heading">Welcome, Sparrow.</GoldText>
        <OrnateDivider style={{ margin: "24px auto" }} />
        <GoldText variant="hint">
          A confirmation has been sent to your phone. The Order will reach you when the time comes.
        </GoldText>
      </div>
    );
  }

  if (state === "already-subscribed") {
    return (
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <GoldText variant="heading">You are already known to us.</GoldText>
        <OrnateDivider style={{ margin: "24px auto" }} />
        <GoldText variant="hint">
          This number is already enrolled. Watch for messages from The Order.
        </GoldText>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        maxWidth: 400,
        width: "100%",
      }}
    >
      <GoldText variant="heading">Join the Order</GoldText>
      <OrnateDivider />
      <GoldText variant="hint" style={{ maxWidth: 340 }}>
        Receive puzzle clues and game updates via SMS.
      </GoldText>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          autoComplete="name"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
      </div>

      <label
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
          cursor: "pointer",
          width: "100%",
        }}
      >
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          style={{
            marginTop: "4px",
            accentColor: colors.gold,
            flexShrink: 0,
            width: "18px",
            height: "18px",
          }}
        />
        <span
          style={{
            fontFamily,
            fontSize: "13px",
            lineHeight: 1.6,
            color: colors.gold60,
          }}
        >
          By checking this box, you agree to receive recurring text messages
          about The Order of the Gilt Frame from Gilt Frame at the phone number
          provided. Message frequency varies. Message and data rates may apply.
          Reply STOP to opt out, HELP for help. Consent is not a condition of
          purchase. See our{" "}
          <a href="/terms" style={{ color: colors.gold80, textDecoration: "underline" }}>
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" style={{ color: colors.gold80, textDecoration: "underline" }}>
            Privacy Policy
          </a>
          .
        </span>
      </label>

      {state === "error" && (
        <GoldText variant="muted" style={{ color: colors.errorRed70 }}>
          {errorMsg}
        </GoldText>
      )}

      {state === "rate-limited" && (
        <GoldText variant="muted" style={{ color: colors.errorRed70 }}>
          Too many attempts. Please try again later.
        </GoldText>
      )}

      <GhostButton
        type="submit"
        disabled={state === "submitting" || !consent || !phone.trim()}
      >
        {state === "submitting" ? "Joining..." : "Join the Order"}
      </GhostButton>
    </form>
  );
}
