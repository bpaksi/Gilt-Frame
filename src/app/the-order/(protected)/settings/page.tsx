import Link from "next/link";
import { getAdminTrack } from "@/lib/admin/track";
import { getPlayerState } from "@/lib/admin/actions";
import { gameConfig } from "@/config";
import ResetChapter from "@/components/admin/ResetChapter";
import SignOutButton from "./SignOutButton";

const LINKS = [
  { href: "/the-order/settings/enroll", label: "Device Enrollment" },
  { href: "/the-order/settings/chapters", label: "Workflows" },
  { href: "/the-order/settings/oracle", label: "AI Chat Review" },
  { href: "/the-order/settings/moments", label: "Snapshots" },
] as const;

export default async function AdminSettingsPage() {
  const track = await getAdminTrack();
  const state = await getPlayerState(track);

  const firstChapterId = Object.keys(gameConfig.chapters)[0];
  const chapterId = state.chapterId ?? firstChapterId;
  const chapter = gameConfig.chapters[chapterId];
  const chapterName = state.chapterName ?? chapter?.name ?? chapterId;
  return (
    <div className="p-4 max-w-xl">
      <div className="text-[11px] font-semibold tracking-[1.5px] uppercase text-admin-text-muted mb-4">
        Settings
      </div>
      <nav className="flex flex-col gap-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="admin-focus group flex items-center justify-between py-3.5 px-4 admin-card text-admin-text no-underline text-sm font-medium transition-all duration-150 hover:shadow-md hover:-translate-y-px"
          >
            <span>{link.label}</span>
            <span className="text-admin-text-faint transition-transform duration-150 group-hover:translate-x-0.5">&rarr;</span>
          </Link>
        ))}
      </nav>
      <div className="h-px bg-admin-border my-6" />
      <ResetChapter
        track={track}
        chapterId={chapterId}
        chapterName={chapterName}
      />
      <SignOutButton />
    </div>
  );
}
