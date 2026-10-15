import { redirect } from "next/navigation";
import { headers } from "next/headers";
import TabBar, { type TabConfig } from "../../components/ui/TabBar";
import { resolveTrack } from "@/lib/track";
import { getQuestState } from "@/lib/actions/quest";
import { colors } from "@/components/ui/tokens";

const GAME_TABS: TabConfig[] = [
  { label: "Pursuit", href: "/pursuit", icon: "marker" },
  { label: "Journey", href: "/journey", icon: "book" },
  { label: "Oracle", href: "/oracle", icon: "eye" },
];

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify the device_token cookie maps to a valid enrollment
  const trackInfo = await resolveTrack();

  if (!trackInfo) {
    redirect("/");
  }

  const questState = await getQuestState();
  const isActive = questState.status === "active";

  // When a website step is active, force all game routes to /pursuit
  if (isActive) {
    const headerList = await headers();
    const pathname = headerList.get("x-pathname") ?? "";
    if (!pathname.startsWith("/pursuit")) {
      redirect("/pursuit");
    }
  }

  const showNav = !isActive;
  const tabs = showNav
    ? GAME_TABS.filter((t) => t.label !== "Pursuit")
    : [];

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: colors.bg,
        display: "flex",
        flexDirection: "column",
        paddingBottom: showNav
          ? "calc(60px + env(safe-area-inset-bottom))"
          : "0",
      }}
    >
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
      {showNav && <TabBar tabs={tabs} />}
    </div>
  );
}
