import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTabBar from "@/components/admin/AdminTabBar";
import TrackToggle from "@/components/admin/TrackToggle";
import { getAdminTrack } from "@/lib/admin/track";
import { verifyAdminSession } from "@/lib/admin/auth";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const hasSessionCookie = !!cookieStore.get("admin_session")?.value;

  if (!hasSessionCookie) {
    notFound(); // No cookie → hide admin existence
  }

  if (!(await verifyAdminSession())) {
    redirect("/the-order"); // Cookie exists but expired → back to login
  }

  const track = await getAdminTrack();

  return (
    <div className="min-h-dvh bg-admin-bg font-sans text-admin-text">
      <AdminSidebar initialTrack={track} />
      <div className="md:ml-56">
        <AdminHeader />
        <div className="flex justify-center px-4 pt-3 md:hidden">
          <TrackToggle initialTrack={track} />
        </div>
        <main className="pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </main>
      </div>
      <AdminTabBar />
    </div>
  );
}
