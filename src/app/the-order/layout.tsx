import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#fafafa",
        color: "#1a1a1a",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      {children}
    </div>
  );
}
