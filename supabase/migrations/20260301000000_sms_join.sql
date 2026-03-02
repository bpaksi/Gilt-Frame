-- SMS Join Flow: subscriber consent tracking + conversation audit log
-- Supports A2P 10DLC / TCPA compliance for the public /join page.

-- ── Enums ────────────────────────────────────────────────────────────────

create type sms_subscriber_status as enum ('active', 'opted_out');
create type sms_direction           as enum ('inbound', 'outbound');
create type sms_keyword_type        as enum ('stop', 'start', 'help', 'info', 'none');

-- ── sms_subscribers ──────────────────────────────────────────────────────

create table sms_subscribers (
  id               uuid primary key default gen_random_uuid(),
  phone            text not null unique,          -- E.164 format
  name             text,
  status           sms_subscriber_status not null default 'active',
  consent_timestamp timestamptz not null default now(),
  consent_ip       text,
  consent_ua       text,
  opted_out_at     timestamptz,
  resubscribed_at  timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_sms_subscribers_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_sms_subscribers_updated_at
  before update on sms_subscribers
  for each row execute function update_sms_subscribers_updated_at();

alter table sms_subscribers enable row level security;

-- ── sms_conversations ────────────────────────────────────────────────────

create table sms_conversations (
  id              uuid primary key default gen_random_uuid(),
  subscriber_id   uuid references sms_subscribers(id) on delete set null,
  direction       sms_direction not null,
  "from"          text not null,
  "to"            text not null,
  body            text not null,
  twilio_sid      text,
  keyword_type    sms_keyword_type not null default 'none',
  created_at      timestamptz not null default now()
);

create index idx_sms_conversations_subscriber on sms_conversations(subscriber_id);
create index idx_sms_conversations_created    on sms_conversations(created_at desc);

alter table sms_conversations enable row level security;
