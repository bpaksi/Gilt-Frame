-- ═══════════════════════════════════════════════════════════════════════════════
-- Initial schema — The Order of the Gilt Frame
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- FK hierarchy:
--   chapter_progress
--     └── step_progress
--          ├── hint_views
--          ├── quest_answers
--          └── message_progress
--
-- All children cascade-delete from their parent.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Device Enrollments ────────────────────────────────────────────────────────
-- Single-use URL token → plants cookie on device
CREATE TABLE device_enrollments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token        text UNIQUE NOT NULL,
  device_token text UNIQUE,
  track        text NOT NULL CHECK (track IN ('test', 'live')),
  user_agent   text,
  enrolled_at  timestamptz,
  last_seen    timestamptz,
  revoked      boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE device_enrollments ENABLE ROW LEVEL SECURITY;

-- ── Chapter Progress ──────────────────────────────────────────────────────────
-- No row = locked, completed_at IS NULL = active, completed_at IS NOT NULL = done
CREATE TABLE chapter_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track        text NOT NULL CHECK (track IN ('test', 'live')),
  chapter_id   text NOT NULL,
  started_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (track, chapter_id)
);

ALTER TABLE chapter_progress ENABLE ROW LEVEL SECURITY;

-- ── Step Progress ─────────────────────────────────────────────────────────────
-- Per-step tracking, FK to chapter_progress
CREATE TABLE step_progress (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_progress_id  uuid NOT NULL REFERENCES chapter_progress(id) ON DELETE CASCADE,
  step_id              text NOT NULL,
  started_at           timestamptz NOT NULL DEFAULT now(),
  scheduled_at         timestamptz,
  completed_at         timestamptz,
  UNIQUE (chapter_progress_id, step_id)
);

ALTER TABLE step_progress ENABLE ROW LEVEL SECURITY;

-- ── Quest Answers ─────────────────────────────────────────────────────────────
-- Individual MultipleChoice answers, FK to step_progress
CREATE TABLE quest_answers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_progress_id uuid NOT NULL REFERENCES step_progress(id) ON DELETE CASCADE,
  question_index  int NOT NULL,
  selected_option text NOT NULL,
  correct         boolean NOT NULL,
  answered_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quest_answers ENABLE ROW LEVEL SECURITY;

-- ── Hint Views ────────────────────────────────────────────────────────────────
-- Hint tier reveals, FK to step_progress
CREATE TABLE hint_views (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_progress_id uuid NOT NULL REFERENCES step_progress(id) ON DELETE CASCADE,
  hint_tier       int NOT NULL,
  viewed_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE hint_views ENABLE ROW LEVEL SECURITY;

-- ── Message Progress ──────────────────────────────────────────────────────────
-- Delivery status for offline messaging steps, FK to step_progress
CREATE TABLE message_progress (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_progress_id uuid REFERENCES step_progress(id) ON DELETE CASCADE,
  "to"            text NOT NULL,
  status          text DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'sent', 'delivered', 'failed')),
  sent_at         timestamptz,
  delivered_at    timestamptz,
  error           text,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE message_progress ENABLE ROW LEVEL SECURITY;

-- ── Moments ───────────────────────────────────────────────────────────────────
-- Journey snapshots + share tokens
CREATE TABLE moments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id       text,
  chapter_id     text,
  narrative_text text,
  moment_type    text NOT NULL CHECK (moment_type IN ('quest_complete', 'chapter_start', 'chapter_complete')),
  share_token    text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  assets         jsonb NOT NULL DEFAULT '[]',
  track          text NOT NULL DEFAULT 'live' CHECK (track IN ('test', 'live')),
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read by share_token" ON moments
  FOR SELECT USING (true);

-- ── Oracle Conversations ──────────────────────────────────────────────────────
-- Gemini Q&A history
CREATE TABLE oracle_conversations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question     text NOT NULL,
  response     text NOT NULL,
  gemini_model text,
  tokens_used  int,
  flagged      boolean NOT NULL DEFAULT false,
  track        text NOT NULL DEFAULT 'live' CHECK (track IN ('test', 'live')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE oracle_conversations ENABLE ROW LEVEL SECURITY;

-- ── Activity Log ──────────────────────────────────────────────────────────────
-- Unified audit trail (player/admin/system events)
CREATE TABLE activity_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track      text CHECK (track IN ('test', 'live')),
  source     text NOT NULL CHECK (source IN ('player', 'admin', 'system')),
  event_type text NOT NULL,
  details    jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Functions
-- ═══════════════════════════════════════════════════════════════════════════════

-- reset_track: purge all data for a track (test only)
CREATE OR REPLACE FUNCTION reset_track(p_track text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_track <> 'test' THEN
    RAISE EXCEPTION 'Reset is only allowed on the test track.';
  END IF;

  -- Cascade: deleting chapter_progress deletes step_progress,
  -- which deletes hint_views, quest_answers, message_progress
  DELETE FROM chapter_progress     WHERE track = p_track;

  -- Non-cascading tables
  DELETE FROM activity_log         WHERE track = p_track;
  DELETE FROM oracle_conversations WHERE track = p_track;
  DELETE FROM moments              WHERE track = p_track;
END;
$$;

-- complete_chapter: mark all steps done + chapter completed (test only)
CREATE OR REPLACE FUNCTION complete_chapter(
  p_track text,
  p_chapter_id text,
  p_step_ids text[],
  p_step_recipients text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cp_id uuid;
  v_sp_id uuid;
  v_step_id text;
  v_recipient text;
  v_idx int;
BEGIN
  IF p_track <> 'test' THEN
    RAISE EXCEPTION 'Complete chapter is only allowed on the test track.';
  END IF;

  -- Upsert chapter_progress as completed
  INSERT INTO chapter_progress (track, chapter_id, completed_at)
  VALUES (p_track, p_chapter_id, now())
  ON CONFLICT (track, chapter_id)
  DO UPDATE SET completed_at = now()
  RETURNING id INTO v_cp_id;

  -- Create step_progress rows for all steps
  FOR v_idx IN 1..array_length(p_step_ids, 1) LOOP
    v_step_id := p_step_ids[v_idx];

    INSERT INTO step_progress (chapter_progress_id, step_id, started_at, completed_at)
    VALUES (v_cp_id, v_step_id, now(), now())
    ON CONFLICT (chapter_progress_id, step_id)
    DO UPDATE SET completed_at = now()
    RETURNING id INTO v_sp_id;

    -- Create message_progress for messaging steps (those with a recipient)
    IF v_idx <= array_length(p_step_recipients, 1) THEN
      v_recipient := p_step_recipients[v_idx];
      IF v_recipient IS NOT NULL AND v_recipient <> '' THEN
        INSERT INTO message_progress (step_progress_id, "to", status, sent_at, delivered_at)
        VALUES (v_sp_id, v_recipient, 'delivered', now(), now());
      END IF;
    END IF;
  END LOOP;
END;
$$;
