-- ENTWURF (noch nicht eingespielt): zentrale Sammelbestellung für alle Geräte.
-- Der Prototyp (figma/prototype.html) speichert den gemeinsamen Entwurf aktuell nur lokal (localStorage).
-- Mit diesem Schema sehen alle Mitarbeiterinnen auf allen Geräten dieselbe Sammelbestellung (Echtzeit über Supabase Realtime).

create table if not exists sammelbestellung (          -- genau eine offene Sammlung (status = 'sammelt'), danach 'freigegeben'
  id            bigint generated always as identity primary key,
  status        text not null default 'sammelt' check (status in ('sammelt','freigegeben')),
  nummer        text unique,                             -- BL-2026-000123, wird bei Freigabe vergeben
  wkz_satz      numeric(5,2) not null default 5,         -- aus Admin (Hersteller)
  erstellt_am   timestamptz not null default now(),
  freigegeben_von text,
  freigegeben_am  timestamptz
);
create unique index if not exists nur_eine_offene_sammlung on sammelbestellung ((status)) where status = 'sammelt';

create table if not exists sammelposition (
  id            bigint generated always as identity primary key,
  sammelbestellung_id bigint not null references sammelbestellung(id) on delete cascade,
  produkt_id    bigint not null,                         -- ID aus dem Produktstamm
  verwendung    text not null check (verwendung in ('sale','tester','cabin')),
  aktion        text not null default 'none',            -- none | 6+1 | 5+1 | 3+1 | 10+2
  menge_bezahlt integer not null check (menge_bezahlt >= 0),
  menge_gratis  integer not null default 0,
  unique (sammelbestellung_id, produkt_id, verwendung)
);

create table if not exists sammelbeitrag (               -- wer hat wie viel zu einer Position beigetragen
  position_id   bigint not null references sammelposition(id) on delete cascade,
  mitarbeiterin text not null,
  menge         integer not null check (menge > 0),
  primary key (position_id, mitarbeiterin)
);

-- Rechte (RLS): alle angemeldeten Mitarbeiterinnen dürfen lesen und Positionen/Beiträge der offenen Sammlung ändern;
-- nur die Freigabe-Person (Rolle 'freigabe') darf status auf 'freigegeben' setzen, Preise/EK sehen und E-Mails auslösen.
