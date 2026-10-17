-- Qué quiere ver cada uno en Matcheá (se elige una sola vez)
alter table guests add column if not exists match_pref text check (match_pref in ('all', 'f', 'm'));
