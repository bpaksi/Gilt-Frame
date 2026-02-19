import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminTabBar from "@/components/admin/AdminTabBar";
import TrackToggle from "@/components/admin/TrackToggle";
import { getAdminTrack } from "@/lib/admin/track";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  if (!adminSession?.value) {
    notFound();
  }

  const track = await getAdminTrack();

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#f8f9fa",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "#1a1a1a",
      }}
    >
      <AdminHeader />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "12px 16px 0",
        }}
      >
        <TrackToggle initialTrack={track} />
      </div>
      <main style={{ paddingBottom: "calc(72px + env(safe-area-inset-bottom))" }}>
        {children}
      </main>
      <AdminTabBar />
    </div>
  );
}
