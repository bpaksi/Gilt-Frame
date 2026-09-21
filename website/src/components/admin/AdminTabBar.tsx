"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Current", href: "/the-order/current", icon: "radar" },
  { label: "Progress", href: "/the-order/progress", icon: "timeline" },
  { label: "Gallery", href: "/the-order/gallery", icon: "gallery" },
  { label: "Devices", href: "/the-order/devices", icon: "devices" },
  { label: "Testing", href: "/the-order/testing", icon: "testing" },
  { label: "Settings", href: "/the-order/settings", icon: "settings" },
] as const;

function isTabActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

function RadarIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2v4" />
    </svg>
  );
}

function TimelineIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
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

function GalleryIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function DevicesIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="18" r="1" />
    </svg>
  );
}

function TestingIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M9 3h6v8l3 9H6l3-9V3z" />
      <path d="M7 14h10" />
    </svg>
  );
}

function SettingsIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function AdminTabBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(60px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-admin-card border-t border-admin-border flex items-stretch z-50 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
      {TABS.map((tab) => {
        const isActive = isTabActive(tab.href, pathname);
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
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-admin-blue rounded-full" />
            )}
            <span className="flex items-center justify-center">
              {tab.icon === "radar" && <RadarIcon color={color} />}
              {tab.icon === "timeline" && <TimelineIcon color={color} />}
              {tab.icon === "gallery" && <GalleryIcon color={color} />}
              {tab.icon === "devices" && <DevicesIcon color={color} />}
              {tab.icon === "testing" && <TestingIcon color={color} />}
              {tab.icon === "settings" && <SettingsIcon color={color} />}
            </span>
            <span
              className={`text-[9px] uppercase tracking-[1px] font-sans leading-none ${
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
