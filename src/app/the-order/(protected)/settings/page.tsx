import Link from "next/link";
import SignOutButton from "./SignOutButton";

const LINKS = [
  { href: "/the-order/settings/enroll", label: "Device Enrollment" },
  { href: "/the-order/settings/chapters", label: "Chapters & Quests" },
  { href: "/the-order/settings/oracle", label: "Oracle Review" },
  { href: "/the-order/settings/moments", label: "Moments" },
  { href: "/the-order/settings/summons", label: "Summons" },
] as const;

export default function AdminSettingsPage() {
  return (
    <div style={{ padding: "16px", maxWidth: "600px" }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "#6b7280",
          marginBottom: "16px",
        }}
      >
        Settings
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: "block",
              padding: "14px 16px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              color: "#1a1a1a",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {link.label} →
          </Link>
        ))}
      </nav>
      <hr
        style={{
          border: "none",
          borderTop: "1px solid #e5e7eb",
          margin: "24px 0 16px",
        }}
      />
      <SignOutButton />
    </div>
  );
}
