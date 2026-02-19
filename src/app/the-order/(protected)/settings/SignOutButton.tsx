"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await fetch("/api/auth/admin/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      style={{
        display: "block",
        width: "100%",
        padding: "14px 16px",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        color: "#c0392b",
        fontSize: "14px",
        fontWeight: 500,
        textAlign: "left",
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  );
}
