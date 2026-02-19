"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Current", href: "/the-order/current", icon: "radar" },
  { label: "Progress", href: "/the-order/progress", icon: "timeline" },
] as const;

function RadarIcon({ color }: { color: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2v4" />
    </svg>
  );
}

function TimelineIcon({ color }: { color: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    >
      <path d="M12 2v20" />
      <circle cx="12" cy="6" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M14 6h4" />
      <path d="M6 12h4" />
      <path d="M14 18h4" />
    </svg>
  );
}

export default function AdminTabBar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "calc(60px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "#fff",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "stretch",
        zIndex: 50,
      }}
    >
      {TABS.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(tab.href + "/");
        const color = isActive ? "#2563eb" : "#9ca3af";

        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              textDecoration: "none",
              minHeight: "44px",
              color,
              transition: "color 0.2s ease",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {tab.icon === "radar" && <RadarIcon color={color} />}
              {tab.icon === "timeline" && <TimelineIcon color={color} />}
            </span>
            <span
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "2px",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color,
                lineHeight: 1,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
