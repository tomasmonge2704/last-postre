alter table guests add column if not exists instagram_name text;
alter table guests add column if not exists sheet_label text;

create table if not exists guest_avatars (
  guest_id     text primary key references guests(id) on delete cascade,
  content_type text not null,
  bytes        bytea not null,
  updated_at   timestamptz not null default now()
);

-- Candidatos de Instagram pendientes de confirmar a mano
create table if not exists ig_candidates (
  guest_id  text not null references guests(id) on delete cascade,
  username  text not null,
  full_name text,
  pic_url   text not null,
  primary key (guest_id, username)
);
