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
      className={`admin-focus block w-full py-3.5 px-4 bg-admin-card border border-admin-border rounded-lg text-admin-red text-sm font-medium text-left font-inherit transition-all duration-150 ${
        loading ? "cursor-not-allowed opacity-60" : "cursor-pointer opacity-100 hover:bg-red-50 hover:border-red-200"
      }`}
    >
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  );
}
