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
    <div
      style={{
        minHeight: "100dvh",
        background: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "360px" }}>
        <h1
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "20px",
            fontWeight: 600,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#333333",
            marginBottom: "40px",
            textAlign: "center",
          }}
        >
          Admin
        </h1>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              height: "48px",
              padding: "0 16px",
              border: "1px solid #d0d0d0",
              fontSize: "16px",
              fontFamily: "Arial, Helvetica, sans-serif",
              outline: "none",
              background: "#fff",
              color: "#333333",
            }}
          />
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                height: "48px",
                padding: "0 44px 0 16px",
                border: "1px solid #d0d0d0",
                fontSize: "16px",
                fontFamily: "Arial, Helvetica, sans-serif",
                outline: "none",
                background: "#fff",
                color: "#333333",
                boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "#999999",
                fontSize: "14px",
                fontFamily: "Arial, Helvetica, sans-serif",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {error && (
            <p
              style={{
                color: "#c62828",
                fontSize: "14px",
                margin: 0,
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              height: "48px",
              background: loading ? "#5a8ab5" : "#336699",
              color: "#ffffff",
              border: "none",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "14px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "8px",
            }}
          >
            {loading ? "Signing in\u2026" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
