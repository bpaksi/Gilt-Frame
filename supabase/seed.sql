-- Chapter progress: prologue=active, ch1-ch8=locked for both tracks
INSERT INTO chapter_progress (track, chapter_id, status) VALUES
  ('test',  'prologue', 'active'),
  ('test',  'ch1',      'locked'),
  ('test',  'ch2',      'locked'),
  ('test',  'ch3',      'locked'),
  ('test',  'ch4',      'locked'),
  ('test',  'ch5',      'locked'),
  ('test',  'ch6',      'locked'),
  ('test',  'ch7',      'locked'),
  ('test',  'ch8',      'locked'),
  ('live',  'prologue', 'active'),
  ('live',  'ch1',      'locked'),
  ('live',  'ch2',      'locked'),
  ('live',  'ch3',      'locked'),
  ('live',  'ch4',      'locked'),
  ('live',  'ch5',      'locked'),
  ('live',  'ch6',      'locked'),
  ('live',  'ch7',      'locked'),
  ('live',  'ch8',      'locked');

-- Vault items: one locked prologue vault item
INSERT INTO vault_items (quest_id, name, description, track) VALUES
  ('prologue', 'The First Seal', 'A relic from the beginning of the journey. Its power has yet to be awakened.', 'live');

-- ─── Test Data ──────────────────────────────────────────────────────────────────

-- Test device enrollment (allows accessing game without physical enrollment)
INSERT INTO device_enrollments (token, device_token, track, enrolled_at, user_agent) VALUES
  ('test-enroll-token', 'test-device-001', 'test', now(), 'TestAgent/1.0');

-- Activate ch1 on test track for quest testing
UPDATE chapter_progress
  SET status = 'active', current_flow_index = 1, started_at = now()
  WHERE track = 'test' AND chapter_id = 'ch1';

-- Sample lore entries (always-unlocked Scrolls of Knowledge)
INSERT INTO lore_entries (title, content, unlock_chapter_id, "order") VALUES
  ('The Founding of the Order',
   'Long before the great museums rose from marble and ambition, a secret fellowship gathered in candlelit chambers. They called themselves the Order of the Gilt Frame, sworn to preserve beauty that the careless world would forget. Their first act was to commission a frame of impossible craftsmanship — gold leaf over ancient oak, carved with symbols only the worthy could read.',
   NULL, 1),
  ('The Language of Markers',
   'The Order communicates through Markers — symbols placed in the world for those with eyes to see. Each Marker contains an hourglass formed by two crossing curves, representing the passage of time and the persistence of art. When you find a Marker, you have found a threshold. What lies beyond is yours to discover.',
   NULL, 2),
  ('The Sparrow''s Role',
   'In the Order''s hierarchy, the Sparrow is the seeker — the one who moves between worlds, carrying fragments of truth from one trial to the next. The Sparrow is not chosen by blood or rank, but by the quality of their seeing. To be named Sparrow is to be entrusted with the Order''s most sacred task: to prove that beauty endures.',
   NULL, 3),
  ('The Compass and Its Secrets',
   'The compass is the Order''s oldest instrument. Not merely a tool for navigation, it is a cipher. Every bearing the Order assigns points toward the next revelation. The needle does not merely find north — it finds meaning. Those who follow the compass with patience will discover that every direction was chosen with purpose.',
   'ch1', 4);

-- Sample moment for Journey tab testing
INSERT INTO moments (quest_id, chapter_id, narrative_text, moment_type, share_token, track) VALUES
  ('ch1', 'ch1',
   'The needle has shown you the way. Take flight, young bird, destiny awaits.',
   'quest_complete', 'test-share-abc123', 'test');
