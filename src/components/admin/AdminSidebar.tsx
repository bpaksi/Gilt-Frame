"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import TrackToggle from "./TrackToggle";

const NAV_LINKS = [
  { href: "/the-order/current", label: "Current", icon: "radar" },
  { href: "/the-order/progress", label: "Progress", icon: "timeline" },
  { href: "/the-order/send-hint", label: "Send Hint", icon: "hint" },
  { href: "/the-order/settings", label: "Settings", icon: "settings" },
] as const;

function RadarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2v4" />
    </svg>
  );
}

function TimelineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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

function HintIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const ICON_MAP = {
  radar: RadarIcon,
  timeline: TimelineIcon,
  hint: HintIcon,
  settings: SettingsIcon,
} as const;

export default function AdminSidebar({
  initialTrack,
}: {
  initialTrack: "test" | "live";
}) {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-admin-blue flex-col z-50 shadow-[2px_0_8px_rgba(0,0,0,0.1)] overflow-y-auto">
      <div className="px-5 pt-6 pb-2">
        <span className="text-[11px] font-semibold tracking-[3px] uppercase text-white/60">
          Dashboard
        </span>
      </div>

      <div className="px-4 pb-5 pt-3">
        <TrackToggle initialTrack={initialTrack} />
      </div>

      <div className="mx-4 mb-3 border-t border-white/10" />

      <nav className="flex-1 flex flex-col gap-0.5 px-3">
        {NAV_LINKS.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = ICON_MAP[link.icon];

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`admin-focus flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium no-underline transition-all duration-150 ${
                isActive
                  ? "bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                  : "text-white/60 hover:bg-white/8 hover:text-white/90"
              }`}
            >
              <Icon />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
