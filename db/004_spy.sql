-- El Espía (realtime). Los roles van aparte: cada celu solo se suscribe a su fila.
create table if not exists spy_matches (
  id          text primary key default gen_random_uuid()::text,
  room_id     text not null references rooms(id) on delete cascade,
  host_id     text not null references guests(id),
  round       int not null default 0,
  status      text not null default 'lobby' check (status in ('lobby', 'playing', 'reveal')),
  place       text,
  starter_id  text,
  ends_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists spy_matches_room_idx on spy_matches (room_id);

create table if not exists spy_players (
  match_id  text not null references spy_matches(id) on delete cascade,
  guest_id  text not null references guests(id),
  joined_at timestamptz not null default now(),
  primary key (match_id, guest_id)
);

create table if not exists spy_roles (
  match_id  text not null references spy_matches(id) on delete cascade,
  round     int not null,
  guest_id  text not null references guests(id),
  place     text,
  role      text not null,
  is_spy    boolean not null,
  primary key (match_id, round, guest_id)
);
