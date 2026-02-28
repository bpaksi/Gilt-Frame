-- Journey Vault: enrich moments table for rich replay data and chapter seals.
--
-- Adds:
--   1. metadata JSONB column for type-specific replay data (Q&A answers, durations, etc.)
--   2. step_id column to link moments to the config step that produced them
--   3. New moment_type enum values for all website component types

-- ── New moment_type values ─────────────────────────────────────────────────────

ALTER TYPE moment_type ADD VALUE IF NOT EXISTS 'narrative_revealed';
ALTER TYPE moment_type ADD VALUE IF NOT EXISTS 'gps_arrival';
ALTER TYPE moment_type ADD VALUE IF NOT EXISTS 'bearing_aligned';
ALTER TYPE moment_type ADD VALUE IF NOT EXISTS 'questions_answered';
ALTER TYPE moment_type ADD VALUE IF NOT EXISTS 'find_confirmed';

-- ── New columns ────────────────────────────────────────────────────────────────

ALTER TABLE moments ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';
ALTER TABLE moments ADD COLUMN IF NOT EXISTS step_id text;
