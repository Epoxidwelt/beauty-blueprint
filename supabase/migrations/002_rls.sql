-- Zugriffsregeln (Row Level Security): Mitarbeiterinnen tragen ein, nur die Inhaberin sieht Preise/WKZ und gibt frei.

create or replace function is_inhaber() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profile where id = auth.uid() and rolle = 'inhaber');
$$;
create or replace function is_mitarbeiter() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profile where id = auth.uid());
$$;

alter table profile        enable row level security;
alter table produkt        enable row level security;
alter table produkt_preis  enable row level security;
alter table hersteller     enable row level security;
alter table aktion         enable row level security;
alter table bestellung     enable row level security;
alter table position       enable row level security;
alter table wkz_position   enable row level security;
alter table beitrag        enable row level security;
alter table protokoll      enable row level security;

-- Profile: alle angemeldeten lesen, nur Inhaberin ändert
create policy profile_lesen   on profile for select using (is_mitarbeiter());
create policy profile_aendern on profile for all    using (is_inhaber()) with check (is_inhaber());

-- Produkte (ohne Preise): alle lesen; Import/Bestand nur Inhaberin
create policy produkt_lesen   on produkt for select using (is_mitarbeiter());
create policy produkt_aendern on produkt for all    using (is_inhaber()) with check (is_inhaber());

-- Preise: NUR Inhaberin
create policy preis_inhaber on produkt_preis for all using (is_inhaber()) with check (is_inhaber());

-- Hersteller-Einstellungen enthalten E-Mail und WKZ-Satz → nur Inhaberin direkt; Mitarbeiterinnen nutzen die Sicht hersteller_oeffentlich
create policy hersteller_inhaber on hersteller for all using (is_inhaber()) with check (is_inhaber());
create view hersteller_oeffentlich with (security_invoker = false) as
  select name, verwendungen, aktionen from hersteller;   -- ohne E-Mail und WKZ
grant select on hersteller_oeffentlich to authenticated;

create policy aktion_lesen   on aktion for select using (is_mitarbeiter());
create policy aktion_aendern on aktion for all    using (is_inhaber()) with check (is_inhaber());

-- Bestellungen: alle sehen die Bestellungen; Mitarbeiterinnen nur die offenen ändern; abgeschlossene nur Inhaberin
create policy bestellung_lesen   on bestellung for select using (is_mitarbeiter());
create policy bestellung_neu     on bestellung for insert with check (is_mitarbeiter() and status = 'offen');
create policy bestellung_aendern_offen on bestellung for update using (is_mitarbeiter() and status = 'offen') with check (status = 'offen' or is_inhaber());
create policy bestellung_inhaber on bestellung for all using (is_inhaber()) with check (is_inhaber());

create policy position_lesen on position for select using (is_mitarbeiter());
create policy position_offen on position for all
  using (exists (select 1 from bestellung b where b.id = bestellung_id and (b.status = 'offen' or is_inhaber())) and is_mitarbeiter())
  with check (exists (select 1 from bestellung b where b.id = bestellung_id and (b.status = 'offen' or is_inhaber())) and is_mitarbeiter());

-- WKZ-Positionen: nur Inhaberin
create policy wkz_inhaber on wkz_position for all using (is_inhaber()) with check (is_inhaber());

create policy beitrag_lesen on beitrag for select using (is_mitarbeiter());
create policy beitrag_eigene on beitrag for all using (profile_id = auth.uid() or is_inhaber()) with check (profile_id = auth.uid() or is_inhaber());

create policy protokoll_inhaber on protokoll for select using (is_inhaber());
create policy protokoll_schreiben on protokoll for insert with check (is_mitarbeiter());

-- WICHTIG: Spalte position.ek_einzel darf Mitarbeiterinnen nicht erreichen → Zugriff nur über die Sicht position_ohne_preis
revoke select on position from authenticated;
grant select (id, bestellung_id, produkt_id, verwendung, aktion, menge_bezahlt, menge_gratis) on position to authenticated;
-- Inhaberin liest ek_einzel über die Funktion bestellung_mit_preisen() (003_functions.sql)

-- Realtime für die gemeinsame Bearbeitung
alter publication supabase_realtime add table bestellung, position, beitrag;
