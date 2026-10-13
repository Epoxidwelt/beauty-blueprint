-- Beauty Lounge — Urlaubsverwaltung (Entwurf, wie 001–004 noch nicht ausgeführt)
-- Urlaubsjahr = 01.11. bis 31.10.; "urlaubsjahr" ist das Startjahr (2026 = 2026/27).
-- Voraussetzung: 001_schema.sql, 002_rls.sql (is_inhaber(), is_mitarbeiter()).

create or replace function urlaubsjahr(d date) returns int
language sql immutable as $$
  select case when extract(month from d) >= 11 then extract(year from d)::int else extract(year from d)::int - 1 end
$$;

-- Urlaubsanspruch je Person und Urlaubsjahr (fehlt ein Eintrag → Standard aus urlaub_einstellung)
create table if not exists urlaub_anspruch (
  profile_id  uuid not null references profile(id) on delete cascade,
  urlaubsjahr int  not null,
  tage        numeric(5,1) not null check (tage >= 0),
  primary key (profile_id, urlaubsjahr)
);

create table if not exists urlaub_einstellung (
  id               boolean primary key default true check (id),   -- genau eine Zeile
  standard_tage    numeric(5,1) not null default 30,
  samstag_zaehlt   boolean not null default false
);
insert into urlaub_einstellung (id) values (true) on conflict do nothing;

create table if not exists urlaub_antrag (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references profile(id) on delete cascade,
  urlaubsjahr    int  not null,
  von            date not null,
  bis            date not null,
  tage           numeric(5,1) not null check (tage > 0),
  notiz          text,
  status         text not null default 'offen' check (status in ('offen','freigegeben','abgelehnt')),
  erstellt_von   uuid references profile(id),
  erstellt_am    timestamptz not null default now(),
  entschieden_von uuid references profile(id),
  entschieden_am  timestamptz,
  gelesen        boolean not null default true,        -- false = Entscheidung noch nicht von der Person gesehen
  check (bis >= von),
  check (urlaubsjahr = urlaubsjahr(von) and urlaubsjahr = urlaubsjahr(bis))
);
create index if not exists urlaub_antrag_person_idx on urlaub_antrag(profile_id, urlaubsjahr);
create index if not exists urlaub_antrag_offen_idx on urlaub_antrag(status) where status = 'offen';

alter table urlaub_anspruch   enable row level security;
alter table urlaub_einstellung enable row level security;
alter table urlaub_antrag     enable row level security;

-- Anspruch: eigene Zeile lesen, Inhaberin alles
create policy anspruch_eigene  on urlaub_anspruch for select using (profile_id = auth.uid() or is_inhaber());
create policy anspruch_inhaber on urlaub_anspruch for all    using (is_inhaber()) with check (is_inhaber());

-- Einstellungen: alle lesen, Inhaberin ändern
create policy urlaub_einst_lesen on urlaub_einstellung for select using (is_mitarbeiter());
create policy urlaub_einst_inh   on urlaub_einstellung for all    using (is_inhaber()) with check (is_inhaber());

-- Anträge: eigene lesen / offen neu anlegen / offene zurückziehen / Entscheidung als gelesen markieren.
-- Kolleginnen sehen nur fremde FREIGEGEBENE Zeiträume (für Überschneidungs-Hinweis), keine Notizen/Anträge.
create policy antrag_eigene_lesen on urlaub_antrag for select using (profile_id = auth.uid() or is_inhaber());
create policy antrag_neu on urlaub_antrag for insert
  with check (profile_id = auth.uid() and status = 'offen' and entschieden_von is null);
create policy antrag_zurueckziehen on urlaub_antrag for delete using (profile_id = auth.uid() and status = 'offen');
create policy antrag_gelesen on urlaub_antrag for update
  using (profile_id = auth.uid()) with check (profile_id = auth.uid() and status = (select a.status from urlaub_antrag a where a.id = urlaub_antrag.id));
create policy antrag_inhaber on urlaub_antrag for all using (is_inhaber()) with check (is_inhaber());

-- Resturlaub je Person und Jahr (Anspruch − freigegebene Tage)
create or replace view urlaub_stand as
select p.id as profile_id, j.urlaubsjahr,
       coalesce(a.tage, e.standard_tage)                                              as anspruch,
       coalesce(sum(r.tage) filter (where r.status = 'freigegeben'), 0)               as genommen,
       coalesce(sum(r.tage) filter (where r.status = 'offen'), 0)                     as beantragt,
       coalesce(a.tage, e.standard_tage) - coalesce(sum(r.tage) filter (where r.status = 'freigegeben'), 0) as rest
from profile p
cross join (select generate_series(urlaubsjahr(current_date) - 5, urlaubsjahr(current_date)) as urlaubsjahr) j
cross join urlaub_einstellung e
left join urlaub_anspruch a on a.profile_id = p.id and a.urlaubsjahr = j.urlaubsjahr
left join urlaub_antrag   r on r.profile_id = p.id and r.urlaubsjahr = j.urlaubsjahr
group by p.id, j.urlaubsjahr, a.tage, e.standard_tage;
-- Hinweis: Die View läuft mit den Rechten des Aufrufers (security_invoker), damit RLS gilt:
alter view urlaub_stand set (security_invoker = true);
