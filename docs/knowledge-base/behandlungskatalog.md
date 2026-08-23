# Behandlungskatalog (echte Daten)

Quelle: `BeautyLounge_Preisliste_A5_2024`, heruntergeladen von [beautylounge-neuss.de](https://www.beautylounge-neuss.de) am 2026-08-23. Ersetzt die bisherigen Platzhalternamen (z. B. "Hydra Boost Signature Facial") im Prototyp durch die tatsächlichen Beauty-Lounge-Behandlungen.

**Wichtiger Vorbehalt:** Das ist die Preisliste, wie sie online veröffentlicht war — keine Garantie, dass sie in jedem Detail mit der aktuellen internen Preisliste übereinstimmt. Zwei Unsicherheiten aus der PDF-Textextraktion:

- **Relax Behandlung**: Preis/Dauer waren im PDF vermutlich als Grafik statt als Text hinterlegt und wurden nicht mit extrahiert. Bitte manuell nachtragen.
- **ASA Peel Behandlung**: Neben "60 Min. € 117 / 3er Kur € 351" stand im selben Layout-Block noch eine zweite Preis-Dauer-Gruppe ("60 Min. € 85 / 75 Min. € 105 / 90 Min. € 126"), deren Zuordnung durch die Spaltenreihenfolge der PDF-Extraktion nicht eindeutig war. Bitte im Original-PDF/Aushang gegenprüfen.

## Gesichtsbehandlungen (skin-relevant, ins Beauty-Needs-System eingebunden)

| Behandlung | Dauer | Preis | Beschreibung |
|---|---|---|---|
| Start Up Behandlung | 70 Min. | 91 € | Kennenlernbehandlung für Neukunden. Hautanalyse + individuell abgestimmte Behandlung (warme Kompressen, Reinigung, sanftes Enzympeeling, Ausreinigung, intensives Serum, Massage, Maske, Abschlusspflege). |
| Clean & Activ Behandlung | 50 Min. | 75 € | Reinigung, intensives Peeling, Entfernen von Unreinheiten, Reinigungsmaske. |
| Relax Behandlung | — | — (siehe Vorbehalt) | Entspannende Verwöhnbehandlung mit intensiver Wirkung — warme Kompressen, Enzympeeling, Ausreinigung, Wirkstoffampulle, Massage, Maske. |
| Spezial Maske (Zusatz) | — | 14 € | Ergänzung zu einer Gesichtsbehandlung. |
| Men Behandlung | 60 / 75 Min. | 88 € / 110 € | Beruhigende Anti-Age-Behandlung speziell für Männerhaut. |
| Aqua Derm Classic | — | 125 € | Tiefenreinigung, Peeling, Wirkstoffeinschleusung, intensive Hydration. |
| Aqua Derm Intensiv | — | 145 € | Wie Classic, zusätzlich Power-Lifting-Maske. |
| ASA Peel Behandlung | 60 Min. | 117 € (3er Kur 351 €) | Fruchtsäure-Hauterneuerung. Verfeinert Pigmentflecken, Unebenheiten, Linien, Fältchen. |
| Hyaluron Infusion Behandlung | 90 Min. | 139 € | Feuchtigkeitskonzept mit Hyaluronsäure für sehr trockene, beanspruchte Haut. |
| Vitamin A Power Behandlung | 90 Min. | 139 € | Gold-Gel-Modellage-Maske, regt Regeneration an, fördert Elastizität. |
| Vitamin A Thermo Behandlung | 90 Min. | 139 € | Wärmende Anti-Age-Behandlung für beanspruchte, regenerationsbedürftige Haut. |
| Diamond Behandlung | 90 Min. | 149 € | Diamantpartikel, verbessert Ausstrahlung, Feuchtigkeitsversorgung, glättend. |
| Micro Needling Gesicht | — | 129 € (+ Hals 22 € + Dekolleté 22 €) | Kollagen-/Elastinstimulation. Geeignet bei Aknenarben, Falten, großporiger Haut, Pigmentflecken, UV-Schäden. Kur-Empfehlung: 6–8×. |

**Zusatzbehandlungen (Gesicht):** Wimpern färben ab 16 €, Augenbrauen färben ab 12 €, Augenbrauen zupfen ab 12 €, Augenbrauen wachsen ab 13 €.

## Weitere Kategorien (aktuell nicht Teil der Beauty-Needs-Logik)

Diese Leistungen sind real und Teil des Studio-Angebots, aber nicht auf Hautbedürfnisse (Hydration, Barrier Repair, …) gemappt, da sie außerhalb der Gesichts-/Hautanalyse liegen. Können bei Bedarf als eigener Zweig ergänzt werden.

- **Wimpern:** Wimpernlifting 64 €, Wimpernwelle 64 €, Browlifting 51 € (jeweils inkl. Keratinpflege/Laminierung)
- **Hand & Nagelpflege:** Wellness Maniküre 40 €, Nagellack 13 €, ProLaq 24 €, Spa Hand Behandlung 28 €, Gelnägel (Naturnagelverstärkung 76 €, Komplett-Set 97 €, Auffüllen 70 €, u. a.)
- **Fußpflege:** Wellness Fußpflege 51 €, Pedix 25 €, Fußmassage 9 €, Spa Fuß Behandlung 28 €, Beautyful Hand & Fuß (Kombi) 139 €
- **Warmwachsbehandlungen:** Oberlippe 14 €, Oberlippe+Kinn 21 €, Augenbrauen 14 €, Beine bis Knie 36 €, Beine komplett 57 €, Brust/Rücken ab 35 €, Arme ab 26 €, Achseln ab 25 €

## Zuordnung zu den 9 Beauty-Needs-Kategorien

Jede Kategorie bekommt genau eine primäre Behandlung zugeordnet (Vereinfachung für den Prototyp — real könnte eine Behandlung mehrere Needs gleichzeitig bedienen, siehe Projektbeschreibung Abschnitt 10).

| Beauty Need | Zugeordnete Behandlung | Begründung |
|---|---|---|
| Hydration | Hyaluron Infusion Behandlung | Explizit "Feuchtigkeitskonzept ... Hyaluronsäure für sehr trockene Haut" |
| Barrier Repair | Start Up Behandlung | Adaptive Einstiegsbehandlung "auf die Bedürfnisse der Haut abgestimmt" — passt zur Stabilisierungsphase |
| Calming | Relax Behandlung | Explizit "Entspannende Verwöhnbehandlung" |
| Pigment Control | ASA Peel Behandlung | Explizit "Pigmentflecken ... werden verfeinert" |
| Sebum Balance | Clean & Activ Behandlung | Explizit "Entfernen von Unreinheiten" |
| Texture Improvement | Micro Needling Gesicht | Explizit "großporige Haut", "Hautstruktur deutlich verbessert" |
| Firmness | Vitamin A Thermo Behandlung | Wärmende Anti-Age-Behandlung, Regenerationsanregung |
| Elasticity | Vitamin A Power Behandlung | Explizit "Elastizität gefördert" |
| Radiance | Diamond Behandlung | Explizit "Ausstrahlung Ihrer Haut verbessert" |

## Homecare / Produkte

Es liegt noch **kein** strukturierter Produktkatalog vor (Abschnitt 13) — die Preisliste nennt nur Partnermarken (Klapp Cosmetics, Alessandro International, Gehwol), keine einzelnen Pflegeprodukte mit Namen. Der Prototyp verwendet deshalb aktuell den ehrlichen Platzhalter "Klapp Heimpflege (individuell nach Hautanalyse)" statt erfundener Produktnamen. Ein echter Produktkatalog müsste separat erfasst werden (z. B. von Klapp direkt oder aus dem Studio-Sortiment).

## Studio-Stammdaten (aus der Preisliste, für spätere Verwendung z. B. im Beauty-Blueprint-Bericht)

Inh. Svenja Gampp · Hoistener Straße 15 · 41466 Neuss · Tel. 02131-4506806 / 0160-99812403 · beauty_lounge@gmx.net · Mo–Sa, Termine nach Vereinbarung. Stornohinweis: Aufwandsentschädigung 50 % bei Absage < 24 Std. vor Termin.
