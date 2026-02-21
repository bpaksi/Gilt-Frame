import { redirect } from "next/navigation";
import TabBar from "../../components/ui/TabBar";
import { resolveTrack } from "@/lib/track";

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
      <TabBar />
    </div>
  );
}
