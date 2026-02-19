-- Phase 4: Admin Panel tables
-- message_progress, activity_log

-- Tracks delivery status for each offline step
create table message_progress (
  id uuid primary key default gen_random_uuid(),
  track text not null check (track in ('test', 'live')),
  progress_key text not null,
  status text default 'pending' check (status in ('pending', 'scheduled', 'sent', 'delivered', 'failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  companion_status text default 'pending',
  companion_sent_at timestamptz,
  error text,
  created_at timestamptz default now(),
  unique(track, progress_key)
);

alter table message_progress enable row level security;

-- Unified activity log (replaces admin_activity_log + player_events)
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  track text check (track in ('test', 'live')),
  source text not null check (source in ('player', 'admin', 'system')),
  event_type text not null,
  details jsonb,
  created_at timestamptz default now()
);

alter table activity_log enable row level security;
