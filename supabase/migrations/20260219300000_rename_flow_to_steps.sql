-- Rename "flow" terminology to "steps" across all tables
ALTER TABLE quest_answers     RENAME COLUMN flow_index TO step_index;
ALTER TABLE hint_views         RENAME COLUMN flow_index TO step_index;
