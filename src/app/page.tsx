import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import LandingPage from "../components/game/LandingPage";

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (session?.value) {
    redirect("/current");
  }

  const deviceTokenCookie = cookieStore.get("device_token");
  let hasDeviceToken = false;

  if (deviceTokenCookie?.value) {
    const supabase = createAdminClient();
    const { data: enrollment } = await supabase
      .from("device_enrollments")
      .select("id")
      .eq("device_token", deviceTokenCookie.value)
      .eq("revoked", false)
      .single();

    hasDeviceToken = !!enrollment;

    if (hasDeviceToken) {
      // Fire-and-forget last_seen update
      supabase
        .from("device_enrollments")
        .update({ last_seen: new Date().toISOString() })
        .eq("device_token", deviceTokenCookie.value)
        .then(() => {});
    }
  }

  return <LandingPage hasDeviceToken={hasDeviceToken} />;
}
