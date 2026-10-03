# Supabase einrichten — Schritt für Schritt (Beta, Weg B)

Stand: 04.10.2026 · Dauer ca. 30–45 Minuten · Voraussetzung: E-Mail-Adresse des Studios

## 1. Projekt anlegen (du)
1. Auf **supabase.com** → „Start your project" → Konto anlegen (E-Mail oder GitHub).
2. **New project**: Name `beauty-lounge-bestellung`, **Region: Frankfurt (eu-central-1)**, ein starkes **Datenbank-Passwort** wählen und sicher aufbewahren (Passwort-Manager). Dieses Passwort bekomme ich **nicht**.
3. Warten, bis das Projekt „Healthy" ist (ca. 2 Minuten).

## 2. Datenbank aufbauen (du, Copy & Paste)
Menü **SQL Editor** → „New query" → den Inhalt der Dateien **in dieser Reihenfolge** einfügen und je „Run" drücken:
1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_rls.sql`
3. `supabase/migrations/003_functions.sql`
4. `supabase/migrations/004_seed.sql`

Bei einer Fehlermeldung: Meldung kopieren und mir schicken — die Dateien sind ein Entwurf und noch nicht in einem echten Projekt gelaufen.

## 3. Produkte laden (du)
Menü **Table Editor** → Tabelle `produkt` → **Import data from CSV** → `supabase/seed/produkt.csv`. Danach Tabelle `produkt_preis` → `supabase/seed/produkt_preis.csv`. (2.224 Produkte, Stand 03.10.2026.)

## 4. Mitarbeiterinnen anlegen (du)
Menü **Authentication → Users → Add user → Create new user** (Häkchen „Auto Confirm User"):
- svenja@… (Passwort/PIN mind. 6 Zeichen), viktoria@…, eleni@…, janine@… — E-Mail-Adressen können Studio-Adressen oder Platzhalter sein (z. B. `svenja@beauty-lounge.local`).
Dann im **SQL Editor** je Person eine Zeile ausführen (die UUID steht in der Benutzerliste):
```sql
insert into profile (id, name, rolle) values ('<UUID Svenja>',   'Svenja',   'inhaber');
insert into profile (id, name, rolle) values ('<UUID Viktoria>', 'Viktoria', 'mitarbeiter');
insert into profile (id, name, rolle) values ('<UUID Eleni>',    'Eleni',    'mitarbeiter');
insert into profile (id, name, rolle) values ('<UUID Janine>',   'Janine',   'mitarbeiter');
```

## 5. Zugangsdaten für die App (du → mir)
Menü **Project Settings → API**: kopiere **Project URL** und den **anon public key** und schick sie mir.
**Nie weitergeben:** Datenbank-Passwort, `service_role`-Key.

## 6. Sicherheit prüfen (ich, mit dir)
- Test: Als Viktoria einloggen → Preise, EK, WKZ dürfen **nicht** abrufbar sein (auch nicht über die Browser-Entwicklerwerkzeuge).
- Test: Als Viktoria „Bestellung abschließen" → muss abgelehnt werden.
- Backups: **Project Settings → Database → Backups** prüfen (täglich), Wiederherstellung einmal testen.
- Datenschutz: unter **Project Settings → Legal** den Auftragsverarbeitungsvertrag (DPA) abschließen.

## 7. Hosting der App (ich bereite vor, du legst das Konto an)
Empfohlen: **Cloudflare Pages** oder **Netlify** (kostenlos), Zugriff nur mit Passwort/Zugangsschutz, HTTPS (Pflicht für den Kamera-Scan). Die App wird als eine Datei veröffentlicht; die Supabase-URL/-Key kommen als Einstellung hinein.

## 8. Beta-Ablauf
1. Test-E-Mail-Adresse bei den Herstellern eintragen (nicht die echten), eine Woche parallel zum alten Ablauf.
2. Alle 4 testen: eintragen, speichern, abschließen (nur Svenja), Mail erneut senden.
3. Fehler/Wünsche sammeln, ich arbeite sie ein.
4. Danach echte Hersteller-Adressen, Altprozess abschalten.
