-- Fix function_search_path_mutable warnings
-- Pin search_path to '' and fully qualify table references in SECURITY DEFINER functions.

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

  DELETE FROM public.chapter_progress     WHERE track = p_track;
  DELETE FROM public.activity_log         WHERE track = p_track;
  DELETE FROM public.oracle_conversations WHERE track = p_track;
  DELETE FROM public.moments              WHERE track = p_track;
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
  VALUES (p_track, p_chapter_id, now())
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
