# Sicherheitskonzept Bestell-App (maximale Absicherung)

Stand: 04.10.2026 · Prinzip: **mehrere unabhängige Schutzschichten** — fällt eine aus, schützt die nächste.

## Schicht 1 — Netzwerk (Cloudflare Access)
- Zugriff nur aus dem **Studio-Netz**: Regel „IP ranges" mit den zwei festen IP-Adressen (IPv4 und ggf. IPv6). Dafür beim Anbieter eine **feste IP** buchen.
- Zusätzlich **eingeladene E-Mail-Adresse + Einmalcode** (Require Emails).
- Optional (stärker): **Cloudflare WARP / Gerätezertifikat** — nur die eingetragenen Studio-iPads kommen durch (Device posture). Auch aus Zuhause nur mit freigegebenem Gerät.
- Sitzungsdauer kurz (z. B. 8 Stunden), Abmelden erzwingen.

## Schicht 2 — Anmeldung (Supabase Auth)
- **Registrierung abschalten** (Authentication → Providers/Settings → „Allow new users to sign up" = AUS). Nur von dir angelegte Konten.
- **Starkes Passwort statt nur 6-stelliger PIN**: mind. 12 Zeichen oder Passkey. (Die 6-stellige PIN ist allein zu schwach; sie genügt nur, solange Schicht 1 sie schützt.)
- **Zwei-Faktor (TOTP)** zwingend für Svenja (Inhaberin) und alle Admin-Zugänge.
- Rate-Limits/CAPTCHA gegen Rätselraten, Sperre nach Fehlversuchen, kurze Token-Laufzeit.
- Abmeldung beim Verlassen: Auto-Logout nach Inaktivität (App-Funktion, baue ich ein).

## Schicht 3 — Datenbank (Supabase / PostgreSQL)
- **Row Level Security** auf allen Tabellen (liegt in `supabase/migrations/002_rls.sql`): ohne Anmeldung nichts, Mitarbeiterinnen nur Erlaubtes.
- **Preise/EK/WKZ** in getrennter Tabelle, nur Inhaberin; Mitarbeiterinnen-Geräte bekommen sie **nie ausgeliefert** (heute noch im Programmcode des Prototyps — das beseitigt die Anbindung).
- Abschluss, Löschen, Preisberechnung nur in **Datenbank-Funktionen**, die die Rolle prüfen.
- Kein `service_role`-Key in der App, niemals. Der `anon`-Key allein darf nichts lesen (Regeln verlangen Anmeldung).
- SSL erzwingen, Backups täglich (besser: Point-in-Time-Recovery), Wiederherstellung testen. Protokoll aller Abschlüsse/Löschungen (`protokoll`).
- Optional (Bezahltarif): Netzwerk-Beschränkung für direkte Datenbankverbindungen.

## Schicht 4 — App und Code
- Admin-Demo-Zugang (`1234`) **entfernen**; Admin nur über Inhaberin-Konto + 2FA.
- Fremdbibliotheken (Excel-Import, Barcode-Scanner) **selbst hosten statt von fremden Servern laden**, Versionen fest — verhindert Manipulation von außen.
- Strenge Sicherheits-Header (Content-Security-Policy, nur eigene Quellen + Supabase), schon teilweise in `dist/_headers`.
- Eingaben prüfen (nur Zahlen bei Mengen/EAN), keine Geheimnisse im Browser-Speicher.

## Schicht 5 — Geräte im Studio
- Nur **Studio-Geräte**, Bildschirmsperre mit langem Code, Auto-Sperre 2 Min., „Mein iPad suchen" + Fernlöschung an.
- Kein geteiltes privates Konto; optional MDM / „Geführter Zugriff" (nur die App).
- Browser darf keine Passwörter automatisch speichern (iCloud-Schlüsselbund aus für diese Seite).

## Schicht 6 — Konten und Betrieb
- **Zwei-Faktor** bei **Cloudflare, Supabase, GitHub, E-Mail-Konto** (Authenticator-App oder Sicherheitsschlüssel).
- **GitHub-Repository privat** stellen (enthält Programm und Produktpreise) — bitte prüfen: Einstellungen → Danger Zone → „Change visibility".
- Passwort-Manager für Studio-Zugänge; Zugangsdaten nie per E-Mail/WhatsApp.
- Mitarbeiterin verlässt das Studio → Konto sofort sperren (Supabase: Benutzer löschen; Cloudflare: E-Mail aus der Liste).
- Notfallplan: Verdacht → Cloudflare-Policy auf „Block", Supabase-Sitzungen beenden, Passwörter ändern, Backup prüfen.

## Schicht 7 — Datenschutz
- EU-Region (Frankfurt), Auftragsverarbeitungsverträge (Supabase, Cloudflare), nur Mitarbeitername und Bestellungen — **keine Kundendaten** in der Bestell-App.
- Aufbewahrung: Bestellungen nach gesetzlicher Frist (meist 6 Jahre Geschäftsbriefe/10 Jahre Buchungsbelege — mit Steuerberatung klären).

## Prüfplan vor dem Beta-Start
1. Aus fremdem WLAN/Mobilfunk: Seite darf **nicht** erreichbar sein.
2. Als Mitarbeiterin: Preise/WKZ **nicht** abrufbar (auch nicht über Entwicklerwerkzeuge/direkte Datenbank-Abfrage).
3. Als Mitarbeiterin: „Abschließen/Löschen/E-Mail" → abgelehnt.
4. Ohne Anmeldung: Datenbank liefert nichts.
5. Neue Registrierung versuchen → muss scheitern.
6. Gerät verloren (Test): Fernsperre, Konto sperren, Sitzung beenden.
7. Optional: externer Penetrationstest vor dem Echtbetrieb.

## Grenzen (ehrlich)
Absolute Sicherheit gibt es nicht. IP-Sperren helfen nur mit fester IP; Zwei-Faktor und Geräteschutz sind genauso wichtig wie die Technik. Die größten realen Risiken sind verlorene Geräte, schwache/weitergegebene Passwörter und Konten ohne Zwei-Faktor.
