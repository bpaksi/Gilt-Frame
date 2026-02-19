"use server";

import { cookies } from "next/headers";

export async function getAdminTrack(): Promise<"test" | "live"> {
  const cookieStore = await cookies();
  const trackCookie = cookieStore.get("admin_track");
  if (trackCookie?.value === "live") return "live";
  return "test";
}

export async function setAdminTrack(track: "test" | "live"): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("admin_track", track, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}
