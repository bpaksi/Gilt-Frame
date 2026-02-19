"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MarkerSVG from "../game/MarkerSVG";

const TABS = [
  {
    label: "Current",
    href: "/current",
    icon: "marker",
  },
  {
    label: "The Journey",
    href: "/journey",
    icon: "book",
  },
  {
    label: "Oracle",
    href: "/oracle",
    icon: "eye",
  },
] as const;

function BookIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function EyeIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function TabBar() {
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
        background: "#0a0a0a",
        borderTop: "1px solid rgba(200, 165, 75, 0.12)",
        display: "flex",
        alignItems: "stretch",
        zIndex: 50,
      }}
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
        const color = isActive
          ? "rgba(200, 165, 75, 0.9)"
          : "rgba(200, 165, 75, 0.35)";

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
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              {tab.icon === "marker" && (
                <MarkerSVG size={22} variant={isActive ? "gold" : "gold"} />
              )}
              {tab.icon === "book" && <BookIcon color={color} />}
              {tab.icon === "eye" && <EyeIcon color={color} />}
            </span>
            <span
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "2px",
                fontFamily: "Georgia, 'Times New Roman', serif",
                color,
                lineHeight: 1,
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
