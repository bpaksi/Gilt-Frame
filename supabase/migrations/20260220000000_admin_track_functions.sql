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

  DELETE FROM chapter_progress      WHERE track = p_track;
  DELETE FROM completed_steps       WHERE track = p_track;
  DELETE FROM message_progress      WHERE track = p_track;
  DELETE FROM quest_answers         WHERE track = p_track;
  DELETE FROM hint_views            WHERE track = p_track;
  DELETE FROM activity_log          WHERE track = p_track;
  DELETE FROM oracle_conversations  WHERE track = p_track;
  DELETE FROM moments               WHERE track = p_track;
END;
$$;

-- complete_chapter: mark all steps done + chapter completed (test only)
-- p_step_ids: text array of all step IDs in the chapter
-- p_progress_keys: text array of progress_keys for offline steps
CREATE OR REPLACE FUNCTION complete_chapter(
  p_track text,
  p_chapter_id text,
  p_step_ids text[],
  p_progress_keys text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_track <> 'test' THEN
    RAISE EXCEPTION 'Complete chapter is only allowed on the test track.';
  END IF;

  -- Upsert chapter_progress as completed
  INSERT INTO chapter_progress (track, chapter_id, completed_at)
  VALUES (p_track, p_chapter_id, now())
  ON CONFLICT (track, chapter_id)
  DO UPDATE SET completed_at = now();

  -- Insert completed_steps for all steps
  INSERT INTO completed_steps (track, chapter_id, step_id)
  SELECT p_track, p_chapter_id, unnest(p_step_ids)
  ON CONFLICT (track, chapter_id, step_id) DO NOTHING;

  -- Mark all offline steps as delivered
  INSERT INTO message_progress (track, progress_key, status, sent_at, delivered_at)
  SELECT p_track, unnest(p_progress_keys), 'delivered', now(), now()
  ON CONFLICT (track, progress_key)
  DO UPDATE SET status = 'delivered', sent_at = now(), delivered_at = now();
END;
$$;
