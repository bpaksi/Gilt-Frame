import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export type TrackInfo = {
  track: "test" | "live";
  deviceToken: string;
};

export async function resolveTrack(): Promise<TrackInfo | null> {
  const cookieStore = await cookies();
  const deviceTokenCookie = cookieStore.get("device_token");

  if (!deviceTokenCookie?.value) return null;

  const supabase = createAdminClient();
  const { data: enrollment } = await supabase
    .from("device_enrollments")
    .select("track")
    .eq("device_token", deviceTokenCookie.value)
    .eq("revoked", false)
    .single();

  if (!enrollment) return null;

  return {
    track: enrollment.track as "test" | "live",
    deviceToken: deviceTokenCookie.value,
  };
}
