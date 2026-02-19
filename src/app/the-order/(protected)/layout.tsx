import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

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

  return <>{children}</>;
}
