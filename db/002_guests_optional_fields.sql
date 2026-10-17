alter table guests alter column name drop not null;
alter table guests alter column instagram drop not null;
alter table guests add column if not exists placeholder boolean not null default false;
