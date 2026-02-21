-- ═══════════════════════════════════════════════════════════════════════════════
-- Convert CHECK constraints to PostgreSQL enum types
-- Produces TypeScript string unions via `pnpm db:types`
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Create enum types ────────────────────────────────────────────────────────

CREATE TYPE public.track_type AS ENUM ('test', 'live');
CREATE TYPE public.moment_type AS ENUM ('quest_complete', 'chapter_start', 'chapter_complete', 'passphrase');
CREATE TYPE public.message_status AS ENUM ('pending', 'scheduled', 'sent', 'delivered', 'failed');
CREATE TYPE public.activity_source AS ENUM ('player', 'admin', 'system');

-- ── Convert columns ─────────────────────────────────────────────────────────

ALTER TABLE public.device_enrollments
  DROP CONSTRAINT device_enrollments_track_check,
  ALTER COLUMN track TYPE public.track_type USING track::public.track_type;

ALTER TABLE public.chapter_progress
  DROP CONSTRAINT chapter_progress_track_check,
  ALTER COLUMN track TYPE public.track_type USING track::public.track_type;

ALTER TABLE public.message_progress
  DROP CONSTRAINT message_progress_status_check,
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE public.message_status USING status::public.message_status,
  ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE public.moments
  DROP CONSTRAINT moments_moment_type_check,
  DROP CONSTRAINT moments_track_check,
  ALTER COLUMN track DROP DEFAULT,
  ALTER COLUMN moment_type TYPE public.moment_type USING moment_type::public.moment_type,
  ALTER COLUMN track TYPE public.track_type USING track::public.track_type,
  ALTER COLUMN track SET DEFAULT 'live';

ALTER TABLE public.oracle_conversations
  DROP CONSTRAINT oracle_conversations_track_check,
  ALTER COLUMN track DROP DEFAULT,
  ALTER COLUMN track TYPE public.track_type USING track::public.track_type,
  ALTER COLUMN track SET DEFAULT 'live';

ALTER TABLE public.activity_log
  DROP CONSTRAINT activity_log_track_check,
  ALTER COLUMN track TYPE public.track_type USING track::public.track_type,
  DROP CONSTRAINT activity_log_source_check,
  ALTER COLUMN source TYPE public.activity_source USING source::public.activity_source;

-- ── Recreate functions with enum-aware casts ────────────────────────────────

CREATE OR REPLACE FUNCTION reset_track(p_track text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_track <> 'test' THEN
    RAISE EXCEPTION 'Reset is only allowed on the test track.';
  END IF;

  DELETE FROM public.chapter_progress     WHERE track = p_track::public.track_type;
  DELETE FROM public.activity_log         WHERE track = p_track::public.track_type;
  DELETE FROM public.oracle_conversations WHERE track = p_track::public.track_type;
  DELETE FROM public.moments              WHERE track = p_track::public.track_type;
END;
$$;

CREATE OR REPLACE FUNCTION complete_chapter(
  p_track text,
  p_chapter_id text,
  p_step_ids text[],
  p_step_recipients text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

  INSERT INTO public.chapter_progress (track, chapter_id, completed_at)
  VALUES (p_track::public.track_type, p_chapter_id, now())
  ON CONFLICT (track, chapter_id)
  DO UPDATE SET completed_at = now()
  RETURNING id INTO v_cp_id;

  FOR v_idx IN 1..array_length(p_step_ids, 1) LOOP
    v_step_id := p_step_ids[v_idx];

    INSERT INTO public.step_progress (chapter_progress_id, step_id, started_at, completed_at)
    VALUES (v_cp_id, v_step_id, now(), now())
    ON CONFLICT (chapter_progress_id, step_id)
    DO UPDATE SET completed_at = now()
    RETURNING id INTO v_sp_id;

    IF v_idx <= array_length(p_step_recipients, 1) THEN
      v_recipient := p_step_recipients[v_idx];
      IF v_recipient IS NOT NULL AND v_recipient <> '' THEN
        INSERT INTO public.message_progress (step_progress_id, "to", status, sent_at, delivered_at)
        VALUES (v_sp_id, v_recipient, 'delivered', now(), now());
      END IF;
    END IF;
  END LOOP;
END;
$$;
