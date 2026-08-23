# Figma-Prototyp

Ablage für Links, Exporte und Notizen zum klickbaren High-Fidelity-Prototyp aus Phase 1 des Rollout-Plans (siehe [Projektbeschreibung.md](../docs/Projektbeschreibung.md), Abschnitt 32).

Ablauf laut Konzept:

1. Klickbarer High-Fidelity-Prototyp in Figma
2. Mitarbeiterinnen führen Testberatungen damit durch
3. Feedback erfassen (Zögern, unklare Fragen, fehlende Antworten, falsch wirkende Empfehlungen, zu lange Schritte)
4. Prototyp verbessern
5. Erst danach: Software entwickeln (`/app`, `/admin`)

**Status:** Figma-Datei noch nicht angelegt. Statt darauf zu warten, wird der funktionale HTML-Klickdummy ([prototype.html](prototype.html)) direkt für **Phase 2** genutzt (echte Testberatungen) — siehe [phase2-testleitfaden.md](phase2-testleitfaden.md). Er simuliert den kompletten Ablauf aus [screen-flow.md](screen-flow.md) — inklusive Fortschritt, Zurück-Navigation und der regelbasierten Auswertung (Punkt 23) — mit echten Behandlungen, echtem Branding, Sicherheitscheck-Begründungen, Buchungs- und E-Mail-Button. Das eigentliche Figma-File kann parallel/danach entstehen, sobald aus den Testberatungen erstes Feedback vorliegt.

Lokal öffnen: Datei im Browser laden, oder `python3 -m http.server` im Ordner starten.

**Inhalte bearbeiten, ohne Code anzufassen:** Fragen, Ziele, Behandlungen und Produkte kann der Prototyp aus einem Google Sheet laden (Objekt `SHEET_CONFIG` ganz oben im `<script>`-Block in `prototype.html`). Aufbau und Einrichtung: [docs/knowledge-base/google-sheet-setup.md](../docs/knowledge-base/google-sheet-setup.md). Ohne eingetragenes Sheet läuft der Prototyp weiter mit den eingebauten Beispieldaten.

**Branding:** Farben (`:root`-Variablen ganz oben im `<style>`-Block) sind direkt aus dem Original-Logo extrahiert (Anthrazit `#3F3F41`, Rosé `#C4879C`/`#9A4B66`). Das Logo selbst liegt unverändert unter [`assets/logo/beauty-lounge-logo.png`](../assets/logo/beauty-lounge-logo.png) und wird nur eingebunden (nicht neu erstellt oder verändert), passend zur Vorgabe aus [Projektbeschreibung.md](../docs/Projektbeschreibung.md), Abschnitt 20.

**Empfehlungslogik:** Behandlungen werden nicht mehr unabhängig je Priorität gewählt, sondern über feste Programm-Familien (`PROGRAM_FAMILIES` in `prototype.html`, z. B. "Glow & Hydration" = Hydration + Radiance) zu einem Phase-1/Phase-2-Plan zusammengefasst. Jede Empfehlung zeigt eine Begründung (welche Hautanalyse-Antworten dazu geführt haben). Eine Priorität außerhalb der Programm-Familie wird ehrlich als "Ebenfalls beobachten" markiert statt als unpassende "Alternative".

**Terminbuchung:** Auf dem Beauty-Blueprint- und dem Abschluss-Screen gibt es einen separaten "Termin online buchen"-Button (`BOOKING_URL` in `prototype.html`, aktuell die Studiobookr-Buchungsseite), mit einer Textzeile, welche Behandlung(en) dafür gebucht werden sollen. **Wichtige Einschränkung:** Studiobookr unterstützt keine Vorauswahl einer Leistung per Link — getestet durch Auswahl einer Leistung und Prüfung der URL, die sich dabei nicht ändert (nur interner App-Zustand). Die Mitarbeiterin muss die passende Behandlung nach dem Klick also selbst auf der Buchungsseite auswählen.

**E-Mail-Zusammenfassung:** Auf dem Abschluss-Screen gibt es einen "Per E-Mail versenden"-Button (`emailSummaryHref()` in `prototype.html`), der das lokale Mailprogramm mit vorausgefüllter Zusammenfassung öffnet (Ziel, Programm, Phasen, Begründungen, Homecare, Buchungslink) — Standardempfänger `info@epoxidwelt.de`, vor dem Versand von der Mitarbeiterin im Mailprogramm noch änderbar. Es wird nichts automatisch im Hintergrund verschickt.
