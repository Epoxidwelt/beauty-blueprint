-- Beauty Lounge — Gerätebuch (Entwurf, wie 001–006 noch nicht ausgeführt)
-- Nur Inhaberin (Svenja) bzw. Admin dürfen lesen und ändern — Mitarbeitende haben keinen Zugriff.
-- Voraussetzung: 001_schema.sql, 002_rls.sql (is_inhaber()).

create table if not exists geraet (
  id            uuid primary key default gen_random_uuid(),
  inventarnr    text not null unique,
  name          text not null,
  hersteller    text,
  modell        text,
  seriennummer  text,
  bereich       text,
  standort      text,
  status        text not null default 'In Betrieb' check (status in ('In Betrieb','Defekt / in Reparatur','Ausgesondert')),
  anschaffung   date,
  lieferant     text,
  garantie_bis  date,
  intervall_monate int,
  letzte_pruefung date,
  einweisung    text,
  notiz         text,
  foto_pfad     text,                      -- Pfad in Supabase Storage (privater Bucket "geraetebuch")
  angelegt_am   timestamptz not null default now(),
  geaendert_am  timestamptz not null default now()
);

create table if not exists geraet_protokoll (
  id        uuid primary key default gen_random_uuid(),
  geraet_id uuid not null references geraet(id) on delete cascade,
  datum     date not null,
  art       text not null,
  text      text,
  von       text
);

alter table geraet           enable row level security;
alter table geraet_protokoll enable row level security;
create policy geraet_inhaber    on geraet           for all using (is_inhaber()) with check (is_inhaber());
create policy protokoll_inhaber on geraet_protokoll for all using (is_inhaber()) with check (is_inhaber());

-- Storage: privater Bucket "geraetebuch" anlegen; Zugriff nur für die Inhaberin
-- insert into storage.buckets (id, name, public) values ('geraetebuch','geraetebuch', false);
-- create policy geraetebuch_inhaber on storage.objects for all using (bucket_id = 'geraetebuch' and is_inhaber()) with check (bucket_id = 'geraetebuch' and is_inhaber());
