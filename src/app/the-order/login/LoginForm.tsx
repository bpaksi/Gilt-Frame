"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
        background: "#fafafa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "360px" }}>
        <h1
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "20px",
            fontWeight: 400,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#1a1a1a",
            marginBottom: "40px",
            textAlign: "center",
          }}
        >
          The Order
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
              border: "1px solid #ddd",
              fontSize: "16px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              outline: "none",
              background: "#fff",
              color: "#1a1a1a",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              height: "48px",
              padding: "0 16px",
              border: "1px solid #ddd",
              fontSize: "16px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              outline: "none",
              background: "#fff",
              color: "#1a1a1a",
            }}
          />
          {error && (
            <p
              style={{
                color: "#c0392b",
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
              background: loading ? "#888" : "#1a1a1a",
              color: "#fafafa",
              border: "none",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "14px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "8px",
            }}
          >
            {loading ? "Entering…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
