import { redirect } from "next/navigation";
import TabBar, { type TabConfig } from "../../components/ui/TabBar";
import { resolveTrack } from "@/lib/track";

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
  // Verify the device_token cookie maps to a valid, non-revoked enrollment
  const trackInfo = await resolveTrack();

  if (!trackInfo) {
    redirect("/");
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        paddingBottom: "calc(60px + env(safe-area-inset-bottom))",
      }}
    >
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
      <TabBar tabs={GAME_TABS} />
    </div>
  );
}
