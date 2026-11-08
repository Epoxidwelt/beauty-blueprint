-- Beauty Lounge — Desinfektions-/Hygienepläne (Entwurf, wie 001–005 noch nicht ausgeführt)
-- Ein Plan je Bereich (allgemein, kosmetik, nagel, fuss, haar). Alle Mitarbeitenden lesen, nur die Inhaberin (Svenja) bzw. Admin ändern.
-- Voraussetzung: 001_schema.sql, 002_rls.sql (is_inhaber(), is_mitarbeiter()).

create table if not exists hygieneplan (
  bereich        text primary key check (bereich in ('allgemein','kosmetik','nagel','fuss','haar')),
  antworten      jsonb not null default '{}'::jsonb,        -- Fragenkatalog
  plan           jsonb,                                     -- { rows: [...], steps: [...], open: [...], notes: '' }
  status         text not null default 'leer' check (status in ('leer','entwurf','abgeschlossen')),
  stand          date,
  naechste_pruefung date,                                   -- stand + 12 Monate
  version        int  not null default 0,
  bearbeitet_von uuid references profile(id),
  geaendert_am   timestamptz not null default now()
);

create table if not exists hygieneplan_verlauf (
  id          bigint generated always as identity primary key,
  bereich     text not null references hygieneplan(bereich),
  version     int  not null,
  abgeschlossen_am date not null default current_date,
  abgeschlossen_von uuid references profile(id)
);

alter table hygieneplan         enable row level security;
alter table hygieneplan_verlauf enable row level security;

create policy hygiene_lesen   on hygieneplan for select using (is_mitarbeiter());
create policy hygiene_aendern on hygieneplan for all    using (is_inhaber()) with check (is_inhaber());
create policy hygiene_verlauf_lesen   on hygieneplan_verlauf for select using (is_mitarbeiter());
create policy hygiene_verlauf_aendern on hygieneplan_verlauf for all    using (is_inhaber()) with check (is_inhaber());

-- Fällige Pläne (12 Monate abgelaufen oder in 30 Tagen) — für Hinweise in der App
create or replace view hygieneplan_faellig with (security_invoker = true) as
select bereich, stand, naechste_pruefung,
       case when naechste_pruefung <= current_date then 'faellig' else 'bald' end as status
from hygieneplan
where status = 'abgeschlossen' and naechste_pruefung <= current_date + 30;

-- Unterweisung: Plan wird an Mitarbeitende gesendet und digital unterschrieben (QM-Nachweis)
create table if not exists hygieneplan_unterschrift (
  id               uuid primary key default gen_random_uuid(),
  bereich          text not null references hygieneplan(bereich),
  version          int  not null,
  plan_stand       date not null,
  profile_id       uuid not null references profile(id) on delete cascade,
  gesendet_von     uuid references profile(id),
  gesendet_am      timestamptz not null default now(),
  status           text not null default 'offen' check (status in ('offen','unterschrieben')),
  unterschrieben_am timestamptz,
  unterschrift     text            -- Bild der Unterschrift (JPEG als Data-URL)
);
create index if not exists hyg_unt_person_idx on hygieneplan_unterschrift(profile_id, status);
alter table hygieneplan_unterschrift enable row level security;
-- Lesen: die eigene Zeile, Inhaberin alles
create policy hyg_unt_lesen on hygieneplan_unterschrift for select using (profile_id = auth.uid() or is_inhaber());
-- Senden/Zurückziehen: nur Inhaberin
create policy hyg_unt_inhaber on hygieneplan_unterschrift for all using (is_inhaber()) with check (is_inhaber());
-- Unterschreiben: nur die eigene, noch offene Zeile
create policy hyg_unt_unterschreiben on hygieneplan_unterschrift for update
  using (profile_id = auth.uid() and status = 'offen')
  with check (profile_id = auth.uid() and status = 'unterschrieben');
