-- Fix overly permissive RLS on moments table.
--
-- The original policy used USING (true), granting any client with the anon key
-- unrestricted SELECT access to all moments rows across all tracks. The intent
-- was to allow sharing a specific moment by its share_token — but the policy
-- did not enforce that constraint.
--
-- Since the app accesses moments exclusively via the service_role client
-- (which bypasses RLS), and no public sharing UI currently exists, we drop the
-- permissive policy. If public share-by-token is shipped in the future, add a
-- scoped policy at that time (e.g. USING (share_token = <param>)).

DROP POLICY IF EXISTS "Public read by share_token" ON moments;
