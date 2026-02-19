/**
 * Wrapper around fetch for admin API calls.
 * Redirects to the admin login page on 401 responses.
 */
export async function adminFetch(
  input: string,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, init);

  if (res.status === 401) {
    window.location.href = "/the-order";
    // Return the response so callers don't throw before redirect completes
    return res;
  }

  return res;
}
