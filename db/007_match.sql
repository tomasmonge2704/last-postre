-- "Matcheá con alguien": swipes entre solteros
create table if not exists swipes (
  from_id    text not null references guests(id) on delete cascade,
  to_id      text not null references guests(id) on delete cascade,
  liked      boolean not null,
  created_at timestamptz not null default now(),
  primary key (from_id, to_id)
);
create index if not exists swipes_to_idx on swipes (to_id) where liked;
