-- Beauty Lounge Bestell-App — Schema (Supabase / PostgreSQL)
-- Reihenfolge: 001_schema.sql → 002_rls.sql → 003_functions.sql → 004_seed.sql
-- STATUS: Entwurf, noch nicht in einem Supabase-Projekt ausgeführt. Zuerst in einem Test-Projekt einspielen und prüfen.

create extension if not exists pgcrypto;

-- Mitarbeiterinnen (Profil zu einem Supabase-Auth-Konto)
create table if not exists profile (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null unique,
  rolle       text not null default 'mitarbeiter' check (rolle in ('mitarbeiter','inhaber')),
  sichtbar    boolean not null default true,
  erstellt_am timestamptz not null default now()
);

-- Produktstamm OHNE Preise (für alle Mitarbeiterinnen lesbar)
create table if not exists produkt (
  id             bigint primary key,            -- ID aus dem Kassensystem-Export
  ean            text,
  name           text not null,
  marke          text not null check (marke in ('KLAPP','GEHWOL','Alessandro')),
  gruppe         text not null default 'Weitere Pflege',
  artikelnummer  text,
  bestand        integer,
  mindestbestand integer,
  aktiv          boolean not null default true,
  aktualisiert_am timestamptz not null default now()
);
create index if not exists produkt_marke_idx on produkt(marke, gruppe);
create index if not exists produkt_ean_idx on produkt(ean);

-- Preise getrennt: nur die Inhaberin darf lesen
create table if not exists produkt_preis (
  produkt_id bigint primary key references produkt(id) on delete cascade,
  vk         numeric(10,2) not null default 0,
  ek         numeric(10,2) not null default 0
);

-- Einstellungen je Hersteller (E-Mail, WKZ, erlaubte Verwendungen/Aktionen)
create table if not exists hersteller (
  name         text primary key check (name in ('KLAPP','GEHWOL','Alessandro')),
  email        text,
  wkz_aktiv    boolean not null default false,
  wkz_satz     numeric(5,2) not null default 5,
  verwendungen text[] not null default array['sale','tester','cabin'],
  aktionen     text[] not null default array['none']
);

-- Aktionen (z. B. 6+1, 10+2)
create table if not exists aktion (
  id          bigint generated always as identity primary key,
  hersteller  text not null references hersteller(name),
  name        text not null,                     -- z. B. '10+2'
  bezahlt     integer not null check (bezahlt > 0),
  gratis      integer not null check (gratis > 0),
  von         date,
  bis         date,
  aktiv       boolean not null default true
);

-- Bestellung = je Hersteller genau eine offene Sammlung ('offen'), danach 'abgeschlossen'
create sequence if not exists bestellnummer_seq;
create table if not exists bestellung (
  id                bigint generated always as identity primary key,
  hersteller        text not null references hersteller(name),
  status            text not null default 'offen' check (status in ('offen','abgeschlossen')),
  nummer            text unique,                  -- BL-2026-000001, wird beim Abschluss vergeben
  wkz_satz          numeric(5,2),
  erstellt_am       timestamptz not null default now(),
  abgeschlossen_von uuid references profile(id),
  abgeschlossen_am  timestamptz,
  mail_gesendet_am  timestamptz
);
create unique index if not exists eine_offene_je_hersteller on bestellung(hersteller) where status = 'offen';

create table if not exists position (
  id            bigint generated always as identity primary key,
  bestellung_id bigint not null references bestellung(id) on delete cascade,
  produkt_id    bigint not null references produkt(id),
  verwendung    text not null check (verwendung in ('sale','tester','cabin')),
  aktion        text not null default 'none',
  menge_bezahlt integer not null default 0 check (menge_bezahlt >= 0),
  menge_gratis  integer not null default 0 check (menge_gratis >= 0),
  -- beim Abschluss festgehaltene Preise (nur Inhaberin lesbar, siehe RLS)
  ek_einzel     numeric(10,2),
  unique (bestellung_id, produkt_id, verwendung)
);

create table if not exists wkz_position (
  id            bigint generated always as identity primary key,
  bestellung_id bigint not null references bestellung(id) on delete cascade,
  produkt_id    bigint not null references produkt(id),
  verwendung    text not null check (verwendung in ('sale','tester','cabin')),
  menge         integer not null default 0 check (menge >= 0),
  ek_einzel     numeric(10,2),
  unique (bestellung_id, produkt_id, verwendung)
);

-- Wer hat wie viel zu einer Position beigetragen
create table if not exists beitrag (
  position_id bigint not null references position(id) on delete cascade,
  profile_id  uuid not null references profile(id),
  menge       integer not null check (menge > 0),
  primary key (position_id, profile_id)
);

-- Protokoll (Import, Abschluss, Löschen, Versand)
create table if not exists protokoll (
  id          bigint generated always as identity primary key,
  zeitpunkt   timestamptz not null default now(),
  profile_id  uuid references profile(id),
  aktion      text not null,
  details     jsonb
);
