-- Phase 4: Admin Panel tables
-- message_progress, admin_activity_log, player_events

-- Tracks delivery status for each offline flow step
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

-- Audit trail for admin actions
create table admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  action_type text not null,
  details jsonb,
  created_at timestamptz default now()
);

alter table admin_activity_log enable row level security;

-- Unified event stream for timeline (track-scoped)
create table player_events (
  id uuid primary key default gen_random_uuid(),
  track text not null check (track in ('test', 'live')),
  event_type text not null,
  details jsonb,
  created_at timestamptz default now()
);

alter table player_events enable row level security;
