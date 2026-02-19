import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#f0f0f0",
        color: "#333333",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
