-- Suscripciones Web Push (un invitado puede tener varios dispositivos)
create table if not exists push_subscriptions (
  endpoint   text primary key,
  guest_id   text not null references guests(id) on delete cascade,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_guest_idx on push_subscriptions (guest_id);
