"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update password.");
        return;
      }

      router.push("/the-order/current");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        className="admin-input admin-focus h-12 px-4 border border-admin-border rounded text-base font-sans outline-none bg-admin-card text-admin-text transition-colors"
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        minLength={8}
        className="admin-input admin-focus h-12 px-4 border border-admin-border rounded text-base font-sans outline-none bg-admin-card text-admin-text transition-colors"
      />
      {error && (
        <p className="text-admin-red text-sm m-0 text-center">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className={`admin-btn admin-focus h-12 border-none font-sans text-sm tracking-[2px] uppercase text-white mt-2 rounded transition-colors duration-150 ${
          loading
            ? "bg-admin-blue-disabled cursor-not-allowed"
            : "bg-admin-blue cursor-pointer hover:bg-admin-blue-hover"
        }`}
      >
        {loading ? "Saving\u2026" : "Set Password"}
      </button>
    </form>
  );
}
