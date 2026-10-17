create table if not exists rooms (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  guest_ids   text[] not null default '{}',
  created_by  text references guests(id) on delete set null,
  used_cards  text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists rooms_updated_at_idx on rooms (updated_at desc);
