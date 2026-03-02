-- Add explicit current_step_id pointer to chapter_progress.
-- Replaces count-based step derivation with a stable step ID reference.

ALTER TABLE chapter_progress ADD COLUMN current_step_id TEXT;

-- Update complete_chapter to clear current_step_id on completion.
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
BEGIN
  IF p_track <> 'test' THEN
    RAISE EXCEPTION 'Complete chapter is only allowed on the test track.';
  END IF;

  INSERT INTO public.chapter_progress (track, chapter_id, completed_at, current_step_id)
  VALUES (p_track::public.track_type, p_chapter_id, now(), NULL)
  ON CONFLICT (track, chapter_id)
  DO UPDATE SET completed_at = now(), current_step_id = NULL
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
