import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

/**
 * Creates a Supabase auth client that reads and writes session cookies
 * automatically (access token + refresh token). Uses SameSite=strict.
 *
 * Pass `responseCookies` from a NextResponse to allow the client to write
 * updated cookies back on token refresh. Omit it for read-only contexts.
 */
export async function createAdminAuthClient(responseCookies?: ResponseCookies) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Write to the response if available (login/refresh flows)
          if (responseCookies) {
            cookiesToSet.forEach(({ name, value, options }) => {
              responseCookies.set(name, value, { ...COOKIE_OPTIONS, ...options });
            });
          }
        },
      },
    }
  );
}
