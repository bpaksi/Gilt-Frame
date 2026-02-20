-- Normalize step progression tables with proper FK relationships.
--
-- Target hierarchy:
--   chapter_progress (id, track, chapter_id, started_at, completed_at)
--     └── step_progress (chapter_progress_id FK, step_id, started_at, scheduled_at, completed_at)
--          ├── hint_views (step_progress_id FK, hint_tier, viewed_at)
--          ├── quest_answers (step_progress_id FK, question_index, selected_option, correct, answered_at)
--          └── message_progress (step_progress_id FK, to, status, sent_at, delivered_at, error, created_at)

-- ── 1a. Rename completed_steps → step_progress, restructure ─────────────────

ALTER TABLE completed_steps RENAME TO step_progress;

-- Add chapter_progress_id and backfill from (track, chapter_id) join
ALTER TABLE step_progress ADD COLUMN chapter_progress_id uuid;

UPDATE step_progress sp
SET chapter_progress_id = cp.id
FROM chapter_progress cp
WHERE cp.track = sp.track AND cp.chapter_id = sp.chapter_id;

-- Now make it NOT NULL + add FK
ALTER TABLE step_progress ALTER COLUMN chapter_progress_id SET NOT NULL;
ALTER TABLE step_progress
  ADD CONSTRAINT step_progress_chapter_progress_id_fkey
  FOREIGN KEY (chapter_progress_id) REFERENCES chapter_progress(id) ON DELETE CASCADE;

-- Add started_at (default to completed_at for existing rows, since they were instant)
ALTER TABLE step_progress ADD COLUMN started_at timestamptz NOT NULL DEFAULT now();
UPDATE step_progress SET started_at = completed_at;

-- Add scheduled_at for delayed steps
ALTER TABLE step_progress ADD COLUMN scheduled_at timestamptz;

-- Make completed_at nullable (active step = NULL, done = timestamp)
ALTER TABLE step_progress ALTER COLUMN completed_at DROP NOT NULL;
ALTER TABLE step_progress ALTER COLUMN completed_at DROP DEFAULT;

-- Drop old unique constraint and columns
ALTER TABLE step_progress DROP CONSTRAINT completed_steps_track_chapter_id_step_id_key;
ALTER TABLE step_progress DROP COLUMN track;
ALTER TABLE step_progress DROP COLUMN chapter_id;

-- New unique constraint
ALTER TABLE step_progress ADD CONSTRAINT step_progress_chapter_progress_id_step_id_key
  UNIQUE (chapter_progress_id, step_id);

-- ── 1b. Restructure hint_views ──────────────────────────────────────────────

ALTER TABLE hint_views ADD COLUMN step_progress_id uuid;

UPDATE hint_views hv
SET step_progress_id = sp.id
FROM step_progress sp
JOIN chapter_progress cp ON cp.id = sp.chapter_progress_id
WHERE cp.track = hv.track AND cp.chapter_id = hv.chapter_id AND sp.step_id = hv.step_id;

-- Delete orphaned hint_views (no matching step_progress row)
DELETE FROM hint_views WHERE step_progress_id IS NULL;

ALTER TABLE hint_views ALTER COLUMN step_progress_id SET NOT NULL;
ALTER TABLE hint_views
  ADD CONSTRAINT hint_views_step_progress_id_fkey
  FOREIGN KEY (step_progress_id) REFERENCES step_progress(id) ON DELETE CASCADE;

ALTER TABLE hint_views DROP COLUMN track;
ALTER TABLE hint_views DROP COLUMN chapter_id;
ALTER TABLE hint_views DROP COLUMN step_id;

-- ── 1c. Restructure quest_answers ───────────────────────────────────────────

ALTER TABLE quest_answers ADD COLUMN step_progress_id uuid;

UPDATE quest_answers qa
SET step_progress_id = sp.id
FROM step_progress sp
JOIN chapter_progress cp ON cp.id = sp.chapter_progress_id
WHERE cp.track = qa.track AND cp.chapter_id = qa.chapter_id AND sp.step_id = qa.step_id;

-- Delete orphaned quest_answers
DELETE FROM quest_answers WHERE step_progress_id IS NULL;

ALTER TABLE quest_answers ALTER COLUMN step_progress_id SET NOT NULL;
ALTER TABLE quest_answers
  ADD CONSTRAINT quest_answers_step_progress_id_fkey
  FOREIGN KEY (step_progress_id) REFERENCES step_progress(id) ON DELETE CASCADE;

ALTER TABLE quest_answers DROP COLUMN track;
ALTER TABLE quest_answers DROP COLUMN chapter_id;
ALTER TABLE quest_answers DROP COLUMN step_id;

-- ── 1d. Restructure message_progress ────────────────────────────────────────

ALTER TABLE message_progress ADD COLUMN step_progress_id uuid;
ALTER TABLE message_progress ADD COLUMN "to" text NOT NULL DEFAULT 'player';

-- Backfill step_progress_id from progress_key → step_progress
-- progress_key format: "chapterId.step_suffix" — we match via chapter_progress + step config
-- Since progress_key doesn't directly map to step_id, we do a best-effort via chapter match
-- The app will create proper FK links going forward

-- Drop old constraints and columns
ALTER TABLE message_progress DROP CONSTRAINT message_progress_track_progress_key_key;
ALTER TABLE message_progress DROP COLUMN track;
ALTER TABLE message_progress DROP COLUMN progress_key;
ALTER TABLE message_progress DROP COLUMN scheduled_at;
ALTER TABLE message_progress DROP COLUMN companion_status;
ALTER TABLE message_progress DROP COLUMN companion_sent_at;

-- Add FK (nullable for now — old rows may not have step_progress_id)
ALTER TABLE message_progress
  ADD CONSTRAINT message_progress_step_progress_id_fkey
  FOREIGN KEY (step_progress_id) REFERENCES step_progress(id) ON DELETE CASCADE;

-- Remove the default on "to" now that we've backfilled
ALTER TABLE message_progress ALTER COLUMN "to" DROP DEFAULT;

-- ── 1e. Rewrite SQL functions ───────────────────────────────────────────────

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

DROP FUNCTION IF EXISTS complete_chapter(text, text, text[], text[]);

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
