-- Replace step_index (int) with step_id (text) across all tables.
-- step_id stores the human-readable config key (e.g. 'prologue_letter')
-- instead of a fragile array position index.

-- completed_steps: drop step_index, add step_id, update unique constraint
ALTER TABLE completed_steps DROP CONSTRAINT completed_steps_track_chapter_id_step_index_key;
ALTER TABLE completed_steps DROP COLUMN step_index;
ALTER TABLE completed_steps ADD COLUMN step_id text NOT NULL;
ALTER TABLE completed_steps ADD CONSTRAINT completed_steps_track_chapter_id_step_id_key UNIQUE (track, chapter_id, step_id);

-- quest_answers: drop step_index, add step_id
ALTER TABLE quest_answers DROP COLUMN step_index;
ALTER TABLE quest_answers ADD COLUMN step_id text NOT NULL;

-- hint_views: drop step_index, add step_id
ALTER TABLE hint_views DROP COLUMN step_index;
ALTER TABLE hint_views ADD COLUMN step_id text NOT NULL;
