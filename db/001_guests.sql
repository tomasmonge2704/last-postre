create table if not exists guests (
  id                  text primary key,
  name                text,
  nicknames           text[] not null default '{}',
  instagram           text unique,
  phone               text,
  gender              text not null check (gender in ('m', 'f')),
  avatar_url          text,
  tags                text[] not null default '{}',
  relationship_status text not null default 'single' check (relationship_status in ('single', 'taken')),
  partner_id          text references guests(id) deferrable initially deferred,
  friend_groups       text[] not null default '{}',
  knows               text[] not null default '{}',
  fun_facts           text[] not null default '{}',
  placeholder         boolean not null default false,
  created_at          timestamptz not null default now()
);
