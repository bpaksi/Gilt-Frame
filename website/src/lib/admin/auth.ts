import { createAdminAuthClient } from "@/lib/supabase/server-auth";

/**
 * Verifies the admin session stored in cookies. Uses @supabase/ssr so that
 * expired access tokens are automatically refreshed via the stored refresh
 * token — no manual token management required.
 */
export async function verifyAdminSession(): Promise<boolean> {
  const supabase = await createAdminAuthClient();
  const { data, error } = await supabase.auth.getUser();
  return !error && !!data.user;
}
