"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type FormState =
  | "idle"
  | "submitting"
  | "success"
  | "updated"
  | "error"
  | "rate-limited";

export default function JoinForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!termsConsent || !email.trim()) return;
    if (smsConsent && !phone.trim()) return;

    setState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          phone: smsConsent ? phone.trim() : undefined,
          consent: smsConsent,
        }),
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

      if (data.updated) {
        setState("updated");
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
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Welcome, Sparrow.
        </h2>
        <p className="mt-3 text-base text-gray-600">
          {smsConsent
            ? "You have been registered! You will be contacted when needed."
            : "You have been registered! Please check back often for messages."}
        </p>
      </div>
    );
  }

  if (state === "updated") {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Welcome back, Sparrow.
        </h2>
        <p className="mt-3 text-base text-gray-600">
          Your preferences have been updated.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email — primary field, required */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-900"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Name (optional) */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-900"
        >
          Name{" "}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* SMS Consent — optional, unchecked by default */}
      <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={smsConsent}
            onChange={(e) => setSmsConsent(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm leading-relaxed text-gray-700">
            I agree to receive recurring SMS/MMS text messages from Gilt Frame
            at the phone number provided. Message frequency varies; up to 10
            messages per month. Message and data rates may apply. Reply STOP to
            opt out, HELP for help. Consent is not a condition of purchase.
          </span>
        </label>

        {/* Phone number — only shown when SMS consent is checked */}
        {smsConsent && (
          <div className="mt-4">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-900"
            >
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(555) 555-1234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Terms & Privacy — required */}
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={termsConsent}
          onChange={(e) => setTermsConsent(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm leading-relaxed text-gray-700">
          I agree to the{" "}
          <Link
            href="/terms"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {/* Error states */}
      {state === "error" && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </p>
      )}
      {state === "rate-limited" && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          Too many attempts. Please try again later.
        </p>
      )}

      {/* Submit — requires email + terms; phone required only if SMS checked */}
      <button
        type="submit"
        disabled={
          state === "submitting" ||
          !termsConsent ||
          !email.trim() ||
          (smsConsent && !phone.trim())
        }
        className="w-full rounded-md bg-gray-900 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
      >
        {state === "submitting" ? "Joining\u2026" : "Sign Up"}
      </button>
    </form>
  );
}
