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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(60px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-admin-card border-t border-admin-border flex items-stretch z-50 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
      {TABS.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(tab.href + "/");
        const color = isActive ? "#336699" : "#999999";

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`admin-focus relative flex-1 flex flex-col items-center justify-center gap-1 no-underline min-h-[44px] transition-colors ${
              isActive ? "text-admin-blue" : "text-admin-text-faint"
            }`}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-admin-blue rounded-full" />
            )}
            <span className="flex items-center justify-center">
              {tab.icon === "radar" && <RadarIcon color={color} />}
              {tab.icon === "timeline" && <TimelineIcon color={color} />}
            </span>
            <span
              className={`text-[10px] uppercase tracking-[2px] font-sans leading-none ${
                isActive ? "font-semibold" : "font-normal"
              }`}
              style={{ color }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
