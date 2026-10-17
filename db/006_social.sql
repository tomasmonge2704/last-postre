-- Apodos y comentarios que los invitados se dejan entre sí
create table if not exists guest_notes (
  id         bigserial primary key,
  about_id   text not null references guests(id) on delete cascade,
  author_id  text not null references guests(id) on delete cascade,
  kind       text not null check (kind in ('apodo', 'comentario')),
  body       text not null check (char_length(body) between 1 and 280),
  created_at timestamptz not null default now()
);
create index if not exists guest_notes_about_idx on guest_notes (about_id, created_at desc);
