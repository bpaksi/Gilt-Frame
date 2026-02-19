-- Device enrollments: single-use URL token → plants cookie on device
CREATE TABLE device_enrollments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token          text UNIQUE NOT NULL,
  device_token   text UNIQUE,
  track          text NOT NULL CHECK (track IN ('test', 'live')),
  user_agent     text,
  enrolled_at    timestamptz,
  last_seen      timestamptz,
  revoked        boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE device_enrollments ENABLE ROW LEVEL SECURITY;

-- Chapter progress: chapter-level activation/completion
-- No row = locked, row with completed_at IS NULL = active, completed_at IS NOT NULL = complete
CREATE TABLE chapter_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track        text NOT NULL CHECK (track IN ('test', 'live')),
  chapter_id   text NOT NULL,
  started_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (track, chapter_id)
);

ALTER TABLE chapter_progress ENABLE ROW LEVEL SECURITY;

-- Completed steps: append-only log of completed step indices per chapter
-- Current step = count(*) from completed_steps for (track, chapter_id)
CREATE TABLE completed_steps (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track        text NOT NULL CHECK (track IN ('test', 'live')),
  chapter_id   text NOT NULL,
  step_index   int NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (track, chapter_id, step_index)
);

ALTER TABLE completed_steps ENABLE ROW LEVEL SECURITY;

-- Quest answers: individual MultipleChoice answers
CREATE TABLE quest_answers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track           text NOT NULL CHECK (track IN ('test', 'live')),
  chapter_id      text NOT NULL,
  flow_index      int NOT NULL,
  question_index  int NOT NULL,
  selected_option text NOT NULL,
  correct         boolean NOT NULL,
  answered_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quest_answers ENABLE ROW LEVEL SECURITY;

-- Hint views: hint tier reveal tracking
CREATE TABLE hint_views (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track      text NOT NULL CHECK (track IN ('test', 'live')),
  chapter_id text NOT NULL,
  flow_index int NOT NULL,
  hint_tier  int NOT NULL,
  viewed_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE hint_views ENABLE ROW LEVEL SECURITY;

-- Moments: journey snapshots + share tokens
CREATE TABLE moments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id       text,
  chapter_id     text,
  narrative_text text,
  moment_type    text NOT NULL CHECK (moment_type IN ('quest_complete', 'chapter_start', 'chapter_complete')),
  share_token    text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  assets         jsonb NOT NULL DEFAULT '[]',
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE moments ENABLE ROW LEVEL SECURITY;

-- Oracle conversations: Gemini Q&A history
CREATE TABLE oracle_conversations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question     text NOT NULL,
  response     text NOT NULL,
  gemini_model text,
  tokens_used  int,
  flagged      boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE oracle_conversations ENABLE ROW LEVEL SECURITY;

-- Lore entries: Scrolls of Knowledge
CREATE TABLE lore_entries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  content           text NOT NULL,
  unlock_chapter_id text,
  "order"           int NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lore_entries ENABLE ROW LEVEL SECURITY;
