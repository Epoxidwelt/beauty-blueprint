# Behandlungskatalog (echte Daten)

**Aktuelle Quelle:** [studiobookr.com/beauty-lounge-66137](https://www.studiobookr.com/beauty-lounge-66137) — die echte Online-Terminbuchungsseite der Beauty Lounge, abgerufen am 2026-08-23. Das ist die **verlässlichste verfügbare Quelle**, da hier tatsächlich buchbare Leistungen mit aktuellen Preisen stehen (nicht nur Marketing-Material). Ersetzt die zuvor verwendete `BeautyLounge_Preisliste_A5_2024`-PDF — die Preise dort waren spürbar veraltet (z. B. Start Up Behandlung: 91 € in der PDF vs. 149 € aktuell bei Studiobookr).

**Wichtige Randnotiz zu Studiobookr/Studiolution:** Im Footer von Studiobookr steht *"studiobookr ist ein Service von studiolution.com"*. Studiobookr ist also das Online-Buchungswidget von **Studiolution**, die daneben auch Kassensystem und Kundenverwaltung anbieten (siehe [Projektbeschreibung.md](../Projektbeschreibung.md), Abschnitt 29, wo "Studiolution" bereits als mögliches künftiges CRM/Buchungssystem genannt wurde). Es gibt aktuell **keine automatisierte Anbindung** zwischen dieser Excel-Tabelle/App und Studiolution — dafür wäre Zugriff auf eine Studiolution-API oder einen Datenexport nötig, den ich nicht habe und aus Sicherheitsgründen auch nicht ungefragt mit Zugangsdaten einrichten würde. Änderungen müssen also weiterhin manuell gepflegt werden (siehe unten).

## Vollständige Leistungsliste

Der komplette, aktuelle Leistungskatalog (alle Kategorien, nicht nur Gesichtsbehandlungen) liegt als Excel-Tabelle vor:

**[exports/Beauty_Lounge_Behandlungskatalog.xlsx](exports/Beauty_Lounge_Behandlungskatalog.xlsx)**

- Tab **„Alle Leistungen"** — alle ca. 118 Positionen von Studiobookr (Kategorie, Behandlung, Preis, Dauer, Beschreibung), inkl. Fußpflege, Maniküre, Wimpern, Massagen, FORMA-Hautstraffung und DIOLAZE-Haarentfernung.
- Tab **„Beauty-Needs-Zuordnung"** — die 9 Kategorien mit ihrer aktuellen Behandlung, exakt im Format der Google-Sheet-BeautyNeeds-Tabelle (siehe [google-sheet-setup.md](google-sheet-setup.md)) — kann bei Bedarf 1:1 in Google Sheets importiert werden.

## Zuordnung zu den 9 Beauty-Needs-Kategorien (aktueller Stand)

| Beauty Need | Behandlung | Dauer | Preis | Begründung |
|---|---|---|---|---|
| Hydration | Soft Needling meets Hyaluron | 90 Min. | 239 € | Explizit „3-fach Hyaluronsäure … aufgepolstert" |
| Barrier Repair | Soft Needling | 60 Min. | 149 € | Explizit „Hautbarriere aufbauen und stärken" |
| Calming | Relax Behandlung | 70 Min. | 129 € | Explizit „Entspannende Verwöhnbehandlung" |
| Pigment Control | ASA Peel Fruchtsäure | 50 Min. | 149 € | Explizit „Pigmente werden minimiert" |
| Sebum Balance | Clean & Activ Behandlung | 50 Min. | 93 € | Explizit „intensive Ausreinigung, geklärtes Hautbild" |
| Texture Improvement | Micro Needling | 60 Min. | 149 € | Explizit „Pickelmale, Narben, Unebenheiten vermindert" |
| Firmness | FORMA 1 Zone | 40 Min. | 119 € | Explizit „Elastizitätsverlust wird stark minimiert" (Radiofrequenz-Hautstraffung — weitere Zonen/Preise siehe Excel) |
| Elasticity | Deluxe Treatments | 90 Min. | 205 € | Klapp-Regenerationsbehandlung (CellPro/Diamond/ExoGen, individuell zusammengestellt) |
| Radiance | MicroDerm meets AquaDerm | 80 Min. | 199 € | Explizit „sofortiger Glow, strahlende Haut" |

**Hinweis:** Die alte Zuordnung (Hyaluron Infusion, Vitamin A Power/Thermo, Diamond Behandlung, ASA Peel Behandlung als Einzelnamen) existiert bei Studiobookr so nicht mehr — diese Einzelbehandlungen wurden zu den VIP-/Kombi-Angeboten „Luxus Treatments", „Deluxe Treatments" und „Repagen Exclusive Treatment" zusammengefasst. `prototype.html` verwendet jetzt ausschließlich die aktuelle Studiobookr-Benennung.

## Kur-Konzepte (Mehrfach-Behandlungen)

Studiobookr bietet einige Leistungen explizit als **Kur** (mehrere Sitzungen als ein Paket) an, buchbar wie jede andere Leistung:

- **ASA Fruchtsäure KUR** — 447 € / 50 Min. (empfohlen: 3er-Kur, inkl. gratis Heimpflege im Wert von 30 €)
- **FORMA 6er KUR** / **FORMA 8er KUR** — 10 % Rabatt auf die gewählte FORMA-Zonenbehandlung als Kur

Das beantwortet die Frage nach Kur-Buchungen: Ja, das ist über den Buchungslink möglich — die Kundin bzw. Mitarbeiterin sucht beim Buchen einfach nach dem Kur-Namen (z. B. „ASA Fruchtsäure KUR") statt der Einzelbehandlung. Eine automatische Vorauswahl/Deep-Link auf eine bestimmte Leistung ist mit den aktuell bekannten Möglichkeiten von Studiobookr nicht umgesetzt (siehe [figma/README.md](../../figma/README.md) zum Buchungs-Button).

## Homecare / Produkte

Es liegt weiterhin **kein** strukturierter Produktkatalog vor (Abschnitt 13). Der Prototyp verwendet den ehrlichen Platzhalter „Klapp Heimpflege (individuell nach Hautanalyse)" statt erfundener Produktnamen — Klapp SkinCare ist als echte Partnermarke bei Studiobookr bestätigt.

## Studio-Stammdaten (aus Studiobookr)

Beauty Lounge · Inh. Svenja Gampp · Team: Viktoria Lauk-Filimonov, Eleni Tserkezi, Janine Reinhardt · Hoistener Str. 15, 41466 Neuss · Tel. 02131 4506806 · Öffnungszeiten: Mo 08:00–15:00, Di–Do 09:00–15:00, Fr 09:00–17:30, Sa 09:00–15:00, So geschlossen.

## Pflege-Workflow für diese Tabelle

1. Änderungen an Preisen/Behandlungen zuerst in der Excel-Datei nachtragen (oder mir Bescheid geben, dann übernehme ich es).
2. Für den Prototyp: entweder die Excel-Daten in Google Sheets importieren und über `SHEET_CONFIG` einbinden (siehe [google-sheet-setup.md](google-sheet-setup.md) — dann lädt die App live), oder mir die Änderung nennen, dann trage ich sie direkt in `DEFAULT_NEED_INFO` in `figma/prototype.html` ein.
3. Eine automatische Rückschreibung nach Studiolution/Studiobookr ist aktuell nicht möglich (siehe oben) — Preisänderungen im echten Buchungssystem müssen weiterhin direkt dort gepflegt werden.
