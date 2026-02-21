"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
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
    <div className="min-h-dvh bg-admin-bg flex items-center justify-center py-10 px-6">
      <div className="w-full max-w-[360px]">
        <h1 className="font-sans text-xl font-semibold tracking-[2px] uppercase text-admin-text mb-10 text-center">
          Admin
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="admin-input admin-focus h-12 px-4 border border-admin-border rounded text-base font-sans outline-none bg-admin-card text-admin-text transition-colors"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="admin-input admin-focus w-full h-12 pl-4 pr-11 border border-admin-border rounded text-base font-sans outline-none bg-admin-card text-admin-text transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="admin-focus absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer text-admin-text-faint text-sm font-sans rounded transition-colors hover:text-admin-text"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {error && (
            <p className="text-admin-red text-sm m-0 text-center">
              {error}
            </p>
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
            {loading ? "Signing in\u2026" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
