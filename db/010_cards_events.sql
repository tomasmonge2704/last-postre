-- Cartas de los juegos, editables desde /admin/juegos.
create table if not exists game_cards (
  id         text primary key default gen_random_uuid()::text,
  game       text not null check (game in ('verdad-reto', 'yo-nunca', 'accion-nombre')),
  type       text check (type in ('verdad', 'reto')),
  category   text not null,
  text       text not null,
  emoji      text,
  physical   boolean not null default false,
  for_guest  text references guests(id) on delete set null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists game_cards_game_idx on game_cards (game, active);

-- Lo que va pasando en la previa, para /admin/actividad.
create table if not exists events (
  id         bigserial primary key,
  kind       text not null,
  guest_id   text references guests(id) on delete cascade,
  target_id  text references guests(id) on delete cascade,
  data       jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists events_created_idx on events (created_at desc);
