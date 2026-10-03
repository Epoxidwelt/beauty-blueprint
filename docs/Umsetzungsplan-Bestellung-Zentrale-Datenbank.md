# Umsetzungsplan: Bestell-App mit zentraler Datenbank

Stand: 03.10.2026 · Grundlage: klickbarer Prototyp `figma/prototype.html` (Bestell-App bereits darin enthalten)

## 1. Ziel

Alle Mitarbeiter tragen auf **ihren eigenen Geräten** (iPad, iPhone, Android) in **eine gemeinsame Sammelbestellung** ein. **Svenja** prüft, gibt frei und löst die E-Mails an die Hersteller aus. Danach beginnt eine neue Sammlung. Produktliste, Bestand, Hersteller-E-Mails und WKZ-Satz liegen **zentral** und werden nicht pro Gerät gepflegt.

## 2. Ausgangslage (bereits fertig im Prototyp)

| Bereich | Stand |
|---|---|
| Sammelbestellung | gemeinsamer Entwurf, Zuordnung wer wie viel eingetragen hat, Abschluss durch Svenja, danach neue Sammlung |
| Verwendung | Verkauf / Tester / Kabinenware je Hersteller (GEHWOL ohne Tester) |
| Aktionen | KLAPP 6+1, 5+1, 3+1; GEHWOL/Alessandro optional 10+2; nur auf Verkaufsware |
| WKZ | nur KLAPP, Satz im Admin, nur für Svenja sichtbar |
| Rechte | Mitarbeiter: eintragen/speichern, keine Preise, kein WKZ, kein Versand; Svenja: alles |
| Katalog | 2.224 Produkte aus Excel (EAN, Artikelnummer, EK, VK, Bestand), Import im Admin mit Vorschau |
| Scanner | EAN-Scan per Kamera, Handeingabe als Ersatz |
| E-Mail | je Hersteller getrennt, Tester/Kabinenware deutlich markiert |

**Lücke:** Alles liegt im Browser des jeweiligen Geräts. Kein gemeinsamer Stand, keine echte Anmeldung, keine geschützten Preise.

## 3. Zielarchitektur

- **Supabase** (EU-Region Frankfurt): PostgreSQL, Anmeldung, Echtzeit, Zugriffsregeln (Row Level Security).
- **Front-End:** zunächst der bestehende HTML-Prototyp, über `supabase-js` angebunden (schneller Weg). Später Übernahme in die Flutter-App bzw. das Next.js-Admin (laut `docs/architecture.md`) — das Datenmodell bleibt gleich.
- **Hersteller-E-Mails:** zunächst weiter per Mail-Programm (mailto). Später automatischer Versand über einen Backend-Dienst (Render/Supabase Edge Function) mit Protokoll.

## 4. Datenmodell (Kern)

| Tabelle | Inhalt |
|---|---|
| `produkt` | ID, EAN, Name, Marke, Produktgruppe, Artikelnummer, VK, **EK**, Bestand, Mindestbestand, aktiv |
| `mitarbeiterin` | Name, Rolle (`mitarbeiter` / `freigabe`), PIN-Hash bzw. Auth-Konto |
| `sammelbestellung` | Status (`sammelt` / `freigegeben`), Nummer BL-…, WKZ-Satz, Freigabe von/am |
| `sammelposition` | Produkt, Verwendung, Aktion, Menge bezahlt/gratis |
| `sammelbeitrag` | Position, Mitarbeiterin, Menge (wer hat wie viel eingetragen) |
| `hersteller_einstellung` | E-Mail-Adresse, WKZ-Satz je Hersteller |
| `aktion` | Hersteller, Name (z. B. 10+2), bezahlt, gratis, Zeitraum, aktiv |
| `import_protokoll` | Datei, Zeitpunkt, Zahl neu/geändert/entfallen |

Schema-Entwurf liegt bereits in `supabase/sammelbestellung.sql` (Sammlung, Positionen, Beiträge).

## 5. Zugriffsregeln (wichtig)

- Preise/EK/WKZ liegen in eigenen Sichten/Spalten, die **nur die Rolle `freigabe`** lesen darf. Mitarbeiter erhalten Produkte **ohne** EK/VK. Das Ausblenden im Bildschirm genügt nicht — die Datenbank muss es erzwingen.
- Mitarbeiter: Positionen und eigene Beiträge der **offenen** Sammlung lesen/ändern.
- Nur `freigabe`: Status auf `freigegeben` setzen, Preise lesen, Hersteller-E-Mails und WKZ-Satz ändern, Import ausführen.
- Genau **eine** offene Sammlung gleichzeitig (Datenbank-Regel).

## 6. Anmeldung

| Variante | Aufwand | Wirkung |
|---|---|---|
| **A: PIN je Mitarbeiterin** (4–6 Ziffern, Svenja Pflicht bei Freigabe) | gering | reicht für ein Studio, Start |
| **B: Supabase-Konten** (E-Mail + Passwort) | mittel | Rechte wirklich von der Datenbank erzwungen, Voraussetzung für die spätere Mitarbeiter-App |

Empfehlung: **A zum Start, B spätestens mit der Flutter-App.** Offen: Entscheidung durch dich.

## 7. Phasen

### Phase 0 — Vorbereitung (du, ca. 30 Min.)
- Supabase-Konto, neues Projekt, Region Frankfurt.
- Mir **Project URL** und **anon public key** geben. Datenbank-Passwort und `service_role`-Key bleiben bei dir.
- Entscheidung Anmeldung (A oder B).
- Liste der Mitarbeiter mit Rollen bestätigen (Svenja = Freigabe).

### Phase 1 — Datenbank aufsetzen (ca. 1 Tag)
- SQL-Migrationen im Repo (`supabase/migrations/`), von dir im Supabase-SQL-Editor ausgeführt.
- Tabellen, Zugriffsregeln, Beispiel-Mitarbeiter, Testdaten.
- Produktstamm einmalig aus der vorhandenen Excel laden (2.224 Produkte).

### Phase 2 — Sammelbestellung zentral (ca. 2–3 Tage)
- Prototyp liest/schreibt Sammelposition und Beiträge in Supabase statt `localStorage`.
- **Echtzeit:** Änderungen einer Mitarbeiterin erscheinen sofort bei allen.
- Gleichzeitiges Bearbeiten: Mengenänderungen als Differenz buchen (nicht überschreiben), damit sich zwei Mitarbeiter nicht gegenseitig die Mengen löschen.
- Freigabe durch Svenja: Nummer vergeben, Sammlung abschließen, neue Sammlung anlegen.
- Offline-Verhalten: Hinweis „keine Verbindung", Eingaben erst nach Verbindung speichern.

### Phase 3 — Rechte und Anmeldung (ca. 1–2 Tage)
- PIN-Anmeldung bzw. Konten, Rollen `mitarbeiter` / `freigabe`.
- Preise/EK/WKZ nur für `freigabe` auslieferbar (Sichten + Regeln).
- Test: Mitarbeiter-Login darf technisch keine Preise abrufen können.

### Phase 4 — Stammdaten zentral (ca. 1–2 Tage)
- Produktimport (Excel/CSV) schreibt in die Datenbank, Vorschau und Bestätigung wie bisher, **einmal für alle Geräte**; Protokoll der Importe.
- Hersteller-E-Mails und WKZ-Satz zentral im Admin.
- **Aktionstabelle** im Admin (Hersteller, Bezeichnung, bezahlt/gratis, Zeitraum) statt fest im Code.

### Phase 5 — Versand und Archiv (ca. 2 Tage)
- Archiv aller abgeschlossenen Bestellungen zentral, durchsuchbar, Neubestellung aus Vorlage.
- Optional: automatischer E-Mail-Versand an die Hersteller (Render/Edge Function), Versandprotokoll, Wiederholung bei Fehler.
- Optional: Bestandsanpassung bei Wareneingang (derzeit nur Anzeige).

### Phase 6 — Test und Einführung (ca. 1 Woche, parallel zum Alltag)
- Testlauf mit Svenja und zwei Mitarbeitern über eine echte Bestellrunde.
- Schulung (kurze Anleitung, 1 Seite je Rolle).
- Umschalten: ab dem Stichtag nur noch zentrale Sammelbestellung.
- Datensicherung: tägliche Backups aktivieren, Wiederherstellung einmal testen.

## 8. Zeitplan (grob)

| Woche | Inhalt |
|---|---|
| 1 | Phase 0, 1 |
| 2 | Phase 2, 3 |
| 3 | Phase 4, 5 |
| 4 | Phase 6 (Testlauf, Einführung) |

Die Zeiten sind Schätzungen und hängen davon ab, wie schnell Supabase eingerichtet ist und wie viele Änderungen sich im Testlauf ergeben.

## 9. Offene Entscheidungen

1. Anmeldung: PIN (A) oder Konten (B)?
2. Soll Svenja auch auf dem Handy freigeben dürfen, oder nur am iPad im Studio?
3. Automatischer E-Mail-Versand an Hersteller gewünscht (Phase 5) oder weiter per Mail-Programm?
4. Echte Hersteller-E-Mail-Adressen (aktuell Platzhalter `beauty_lounge@gmx.net`).
5. Bestand: weiter nur Anzeige aus dem Excel-Export, oder später Abgleich mit dem Kassensystem?
6. Welches Kassen-/Terminsystem liefert die Exporte, und gibt es eine Schnittstelle (API) für Produkte/Bestand?
7. Sollen die 31 Artikel ohne erkennbare Marke (Duftkerzen La Natura, Überraschungstüten …) aufgenommen werden, und unter welcher Marke?

## 10. Risiken und Gegenmaßnahmen

| Risiko | Gegenmaßnahme |
|---|---|
| Preise für Mitarbeiter abrufbar | Zugriffsregeln in der Datenbank, Test mit Mitarbeiter-Login |
| Zwei Mitarbeiter ändern gleichzeitig dieselbe Zeile | Mengen als Differenz buchen, Echtzeit-Anzeige |
| Keine Internetverbindung im Studio | Hinweis und Zwischenspeicher, Eingaben nachsenden |
| Fehlerhafter Import überschreibt Produkte | Vorschau, Bestätigung, Plausibilitätsprüfung, Import-Protokoll, Backup |
| Falsche Hersteller-Zuordnung | Zuordnungstabelle im Admin, Meldung bei unbekannter Marke |
| Datenschutz (Mitarbeiternamen, Bestellhistorie) | EU-Region, Rollen/Rechte, Zugriff nur für Berechtigte |
| Einmann-Abhängigkeit beim Betrieb | Dokumentation im Repo, `service_role`-Key und Backup-Zugang bei der Studioleitung |

## 11. Was ich (Claude) brauche und liefere

**Von dir:** Supabase URL + anon key, Entscheidungen aus Abschnitt 9, aktuelle Produkt-Excel, Hersteller-E-Mails.

**Ich liefere je Phase:** getestete Änderungen im Prototyp, SQL zum Einspielen, aktualisierte README/Anleitung, Test-Protokoll. Ich kann kein Supabase-Konto anlegen und keine Zugangsdaten für dich verwalten.

## 12. Nächster Schritt

Phase 0 starten: Supabase-Projekt anlegen, URL und anon key schicken, Anmeldung (A/B) wählen. Danach beginne ich mit Phase 1.
