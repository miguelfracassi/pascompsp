-- Rode no SQL Editor do Supabase
create table if not exists events(
  id bigint generated always as identity primary key,
  name text, date text, organizer text, cover text,
  slideshow boolean default false
);
create table if not exists photos(
  id bigint generated always as identity primary key,
  event_id bigint references events(id) on delete cascade,
  full text, thumb text, descs jsonb default '[]'
);
create index if not exists photos_event_idx on photos(event_id);
alter table events enable row level security;
alter table photos enable row level security;
-- sem policies: só a chave service_role (usada no servidor) acessa
