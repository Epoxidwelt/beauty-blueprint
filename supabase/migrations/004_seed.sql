-- Grunddaten
insert into hersteller (name, email, wkz_aktiv, wkz_satz, verwendungen, aktionen) values
  ('KLAPP',      null, true,  5, array['sale','tester','cabin'], array['none','6+1','5+1','3+1']),
  ('GEHWOL',     null, false, 0, array['sale','cabin'],          array['none','10+2']),
  ('Alessandro', null, false, 0, array['sale','tester','cabin'], array['none','10+2'])
on conflict (name) do nothing;

insert into aktion (hersteller, name, bezahlt, gratis) values
  ('KLAPP','6+1',6,1), ('KLAPP','5+1',5,1), ('KLAPP','3+1',3,1),
  ('GEHWOL','10+2',10,2), ('Alessandro','10+2',10,2)
on conflict do nothing;

-- Mitarbeiterinnen: erst in Supabase → Authentication → Users anlegen (E-Mail + PIN/Passwort), dann hier das Profil ergänzen:
-- insert into profile (id, name, rolle) values ('<UUID aus Auth>', 'Svenja', 'inhaber');
-- insert into profile (id, name, rolle) values ('<UUID aus Auth>', 'Viktoria', 'mitarbeiter');
