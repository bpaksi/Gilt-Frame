import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import IntroPage from "../components/game/IntroPage";

export const metadata: Metadata = {
  title: "The Order of the Gilt Frame",
};

export default async function Home() {
  const cookieStore = await cookies();
  const deviceTokenCookie = cookieStore.get("device_token");

  if (deviceTokenCookie?.value) {
    const supabase = createAdminClient();
    const { data: enrollment } = await supabase
      .from("device_enrollments")
      .select("id")
      .eq("device_token", deviceTokenCookie.value)
      .single();

    if (enrollment) {
      await supabase
        .from("device_enrollments")
        .update({ last_seen: new Date().toISOString() })
        .eq("device_token", deviceTokenCookie.value);

      redirect("/pursuit");
    }
  }

  return <IntroPage />;
}
