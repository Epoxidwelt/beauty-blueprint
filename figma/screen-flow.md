# Screen-Flow für den Figma-Prototyp (Phase 1)

Konkrete Screen-für-Screen-Aufschlüsselung des Beratungsflows aus [docs/Projektbeschreibung.md](../docs/Projektbeschreibung.md) (Abschnitt 8), als direkte Vorlage für den klickbaren Figma-Prototyp. Jeder Screen ist so beschrieben, dass er als eigenes Figma-Frame angelegt werden kann.

**Legende Design-Modus** (Abschnitt 21): `neutral` = reduziert, kaum Farbe · `dezent` = leichte Beauty-Lounge-Akzente · `brand` = volle Markenwelt.

---

## 0. Login

- **Zweck:** Mitarbeiterin meldet sich an.
- **Inhalt:** Logo, E-Mail/PIN oder Auswahl aus Mitarbeiterliste (kein komplexes Passwort-Handling im Prototyp nötig).
- **Interaktion:** 1 Tap auf eigenen Namen (falls Geräte-Login pro Mitarbeiterin) oder einfaches Login-Formular.
- **Design-Modus:** `brand`
- **Weiter zu:** 1

## 1. Kundin auswählen

- **Zweck:** Einstieg in eine Beratung.
- **Inhalt:** Drei große Karten:
  1. Neue Kundin
  2. Bestehende Kundin (Suche/Liste)
  3. Offene Beratung fortsetzen (falls vorhanden, mit Badge/Anzahl)
- **Interaktion:** 1 Tap
- **Design-Modus:** `dezent`
- **Weiter zu:** 1a (neu), 1b (bestehend) oder direkt in den letzten offenen Schritt

### 1a. Neue Kundin anlegen

- **Zweck:** Minimaler Stammdatensatz.
- **Inhalt:** Name, ggf. Geburtsdatum/Alter, Kontakt — bewusst kurz, kein vollständiges CRM-Formular.
- **Interaktion:** Wenig Texteingabe, danach automatische Weiterleitung.
- **Design-Modus:** `dezent`
- **Weiter zu:** 2

### 1b. Bestehende Kundin

- **Zweck:** Kundin suchen/auswählen, optional letzten Beauty Blueprint einsehen.
- **Design-Modus:** `dezent`
- **Weiter zu:** 2

---

**Ab hier: Beratungsmodus aktiv** (Abschnitt 7) — nur noch aktueller Baustein, Antwortmöglichkeiten, dezenter Fortschritt, Zurück-Pfeil. Keine Menüs, keine Behandlungs-/Produktanzeigen.

## 2. Ziel verstehen

- **Zweck:** Kundenziel erfassen.
- **Inhalt:** Kartenraster mit Zielen (mehr Feuchtigkeit & Glow, jünger/frischer, reinere Haut, weniger Pigmentflecken, empfindliche Haut beruhigen, feinere Poren, bessere Hautstruktur, Straffung, allgemeine Hautverbesserung). Mehrfachauswahl möglich, aber mit klarer Priorisierung (z. B. "Hauptziel" zuerst antippen).
- **Interaktion:** 1 Tap pro Ziel, automatische Weiterleitung nach Bestätigung.
- **Design-Modus:** `neutral`
- **Weiter zu:** 3

## 3. Pain Point verstehen

- **Zweck:** Was konkret stört.
- **Inhalt:** Karten, kontextabhängig vom gewählten Ziel gefiltert (z. B. bei "reinere Haut" andere Pain-Point-Optionen als bei "jünger aussehen").
- **Design-Modus:** `neutral`
- **Weiter zu:** 4

## 4. Anlass & Zeitrahmen

- **Zweck:** Kontext für die Strategie (Dringlichkeit).
- **Inhalt:** Karten: Alltag, Hochzeit, Urlaub, Event, beruflicher Anlass, Prävention, langfristige Verbesserung. Bei Anlass mit Termin optional: Datum (einfacher Picker).
- **Design-Modus:** `neutral`
- **Weiter zu:** 5

## 5. Lifestyle & Pflege

- **Zweck:** Nur zielrelevante Zusatzinfos.
- **Inhalt:** Dynamisch gefilterte Fragen (Sonnenschutz, aktuelle Pflegeroutine, Stress, Schlaf, Trinkmenge, Sonneneinstrahlung, Rauchen, bisherige Behandlungen) — jeweils als Ja/Nein oder 3–4-stufige Karten, nicht als Freitext.
- **Design-Modus:** `neutral`
- **Weiter zu:** 6

## 6. Sicherheitscheck

- **Zweck:** Kontraindikationen prüfen, bevor irgendetwas empfohlen wird.
- **Inhalt:** Kurze Fragen (Schwangerschaft/Stillzeit, Medikamente, Allergien, akute Hautveränderungen, offene Stellen, frische Behandlungen, starke Sonnenexposition, bekannte Unverträglichkeiten). Jede Antwort triggert intern Grün/Gelb/Rot.
- **Interaktion:** Ja/Nein-Karten. Bei Gelb/Rot: dezenter Hinweis-Banner "Bitte fachlich prüfen", aber Ablauf wird nicht blockiert — Mitarbeiterin entscheidet.
- **Design-Modus:** `neutral`
- **Weiter zu:** 7

## 7. Fachliche Hautanalyse

- **Zweck:** Mitarbeiterin bewertet den tatsächlichen Hautzustand.
- **Inhalt:** Je Parameter (Feuchtigkeit, Hautbarriere, Sensibilität, Pigmentierung, Unreinheiten, Sebum, Poren, Falten, Elastizität, Spannkraft, Glow, Hautstruktur) eine 4-stufige Skala: nicht vorhanden / leicht / mittel / stark, als horizontale Segment-Kontrolle oder 4 Karten.
- **Interaktion:** 1 Tap pro Parameter, ggf. als Serie von Einzel-Screens (ein Parameter pro Bildschirm) statt einem langen Formular — passend zu "eine Entscheidung pro Bildschirm".
- **Design-Modus:** `neutral`
- **Weiter zu:** 8

## 8. Auswertung (Übergangsscreen)

- **Zweck:** Kurzer Ladezustand, in dem die Engine intern die Beauty-Needs-Prioritäten berechnet (Abschnitt 23).
- **Inhalt:** Ruhige Ladeanimation, kein Formular.
- **Design-Modus:** `neutral` → `dezent` (Übergang beginnt hier)
- **Weiter zu:** 9

---

**Ab hier: Ergebnis-Bereich** — volle Markenwelt darf sichtbar werden (Abschnitt 21).

## 9. Beauty Strategy

- **Zweck:** Fachliche Strategie zeigen, noch ohne konkrete Behandlungen/Produkte.
- **Inhalt:** Kundenziel (Kurzfassung), Hauptpriorität, zweite Priorität, dritte Priorität — als klare, große Textblöcke/Karten.
- **Design-Modus:** `dezent`
- **Weiter zu:** 10

## 10. Empfehlungen

- **Zweck:** Konkrete Vorschläge, die die Mitarbeiterin prüft.
- **Inhalt:** Hauptbehandlung, ergänzende Behandlung, alternative Behandlung, passende Homecare, möglicher Behandlungsplan — je als Karte mit Bild/Name/Kurzbeschreibung.
- **Interaktion:** Pro Karte: übernehmen / austauschen / entfernen / ergänzen / kommentieren (kleine Icon-Buttons, kein Freitextzwang).
- **Design-Modus:** `dezent`
- **Weiter zu:** 11

## 11. Beauty Blueprint (Ergebnis)

- **Zweck:** Der finale, hochwertige Kundenplan.
- **Inhalt:** Ziel, wichtigste Hautbedürfnisse, Strategie, empfohlene Behandlungen, Produkte, Pflegeroutine (Morgen/Abend), Zeitplan, nächster Checkpoint, nächster sinnvoller Schritt.
- **Interaktion:** Freigeben-Button (bestätigt), Bearbeiten-Möglichkeit zurück zu Screen 10.
- **Design-Modus:** `brand` (emotionaler Höhepunkt)
- **Weiter zu:** 12

## 12. Abschluss

- **Zweck:** Beratung speichern, optional Bericht erzeugen.
- **Inhalt:** Bestätigung "Beauty Blueprint gespeichert", Optionen: PDF erzeugen (Punkt 27), zurück zur Kundinnenauswahl.
- **Design-Modus:** `brand`

---

## Für den Prototyp nicht in Screens abgebildet (bewusst weggelassen)

Admin-Bereich, Beauty Case/Journey-Historie über die aktuelle Beratung hinaus, CRM-Anbindung — passend zum reduzierten V1.0-Fokus (Abschnitt 30–31). Diese können als separate spätere Prototyp-Iteration ergänzt werden, sobald der Kern-Beratungsflow validiert ist.

## Nächste Schritte

1. Screens 0–12 als Frames in Figma anlegen (Reihenfolge wie oben, ein Frame = ein Bildschirm)
2. Klickbare Verknüpfungen zwischen den Frames gemäß "Weiter zu"
3. Mit 2–3 Testkundinnen-Szenarien durchklicken (siehe Abschnitt 32, Phase 2)
4. Reibungspunkte in diesem Dokument oder direkt in Figma-Kommentaren festhalten
