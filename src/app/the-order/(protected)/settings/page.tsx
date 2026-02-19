import Link from "next/link";

export default function AdminSettingsPage() {
  return (
    <div style={{ padding: "40px 24px", maxWidth: "600px" }}>
      <h1
        style={{
          fontSize: "20px",
          fontWeight: 400,
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: "32px",
        }}
      >
        Settings
      </h1>
      <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Link
          href="/the-order/settings/enroll"
          style={{
            display: "block",
            padding: "16px",
            border: "1px solid #ddd",
            color: "#1a1a1a",
            textDecoration: "none",
            fontSize: "14px",
            letterSpacing: "1px",
          }}
        >
          Device Enrollment →
        </Link>
      </nav>
    </div>
  );
}
