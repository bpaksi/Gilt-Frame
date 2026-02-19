-- Phase 3: Add track columns to tables missing them + RLS policies

-- Add track columns
ALTER TABLE moments ADD COLUMN track text NOT NULL DEFAULT 'live'
  CHECK (track IN ('test', 'live'));
ALTER TABLE oracle_conversations ADD COLUMN track text NOT NULL DEFAULT 'live'
  CHECK (track IN ('test', 'live'));
-- RLS policies (service_role bypasses all; these are for edge cases)
-- Allow reading moments by share_token (public moment pages, no auth)
CREATE POLICY "Public read by share_token" ON moments
  FOR SELECT USING (true);

-- Allow reading lore entries (public, filtering by unlock handled in app)
CREATE POLICY "Public read lore" ON lore_entries
  FOR SELECT USING (true);
