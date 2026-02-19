import Link from "next/link";
import SignOutButton from "./SignOutButton";

const LINKS = [
  { href: "/the-order/settings/enroll", label: "Device Enrollment" },
  { href: "/the-order/settings/chapters", label: "Workflows" },
  { href: "/the-order/settings/oracle", label: "AI Chat Review" },
  { href: "/the-order/settings/moments", label: "Snapshots" },
  { href: "/the-order/settings/summons", label: "Activation" },
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
          color: "#666666",
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
              border: "1px solid #d0d0d0",
              borderRadius: "8px",
              color: "#333333",
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
          borderTop: "1px solid #d0d0d0",
          margin: "24px 0 16px",
        }}
      />
      <SignOutButton />
    </div>
  );
}
