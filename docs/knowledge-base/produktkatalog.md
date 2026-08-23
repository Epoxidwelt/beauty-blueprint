# Produktkatalog (echte Daten)

**Quelle:** Direkter Export aus Studiolution (Produktbestand), von Gerald per Google Sheet geteilt, abgerufen am 2026-08-23 — 2229 Positionen insgesamt. Das ist das komplette Studio-Sortiment (inkl. Nagellacke, UV/LED-Farbsysteme, Geräte, Möbel, Merchandising) — für die Homecare-Empfehlung der Beratungs-App relevant ist nur der Ausschnitt an **KLAPP-SkinCare-Gesichtspflegeprodukten**.

## Eingrenzung

Von 2229 Positionen wurden gefiltert:

1. Hersteller = KLAPP Group → 569 Produkte (alle übrigen Marken/Kategorien wie Alessandro Nagelpflege, Gehwol Fußpflege, UV/LED-Farbsysteme, Geräte, Möbel sind für die Hautberatung nicht relevant)
2. Davon nur real bestellbare Endkundenware: Preis > 0 €, keine Tester, keine „KABI"-Großgebinde (professionelle Nachfüllgrößen), keine Proben → **379 Homecare-Produkte**

Die vollständige Liste dieser 379 Produkte (alle KLAPP-Linien: HYALURONIC, CAVIAR POWER, DIAMOND, C PURE, CS III COLLAGEN STIMULATION, BETA GLUCAN, CLEAN & ACTIVE, PSC PROBLEM SKIN CARE, REPAGEN EXCLUSIVE, X-TREME, u. v. m.) liegt hier:

**[exports/Beauty_Lounge_Produktkatalog.xlsx](exports/Beauty_Lounge_Produktkatalog.xlsx)**

- Tab **„Homecare-Produkte (KLAPP)"** — alle 379 Produkte (Produktlinie, Name, Preis, Artikelnummer, EAN)
- Tab **„Beauty-Needs-Produkte"** — die 9 Kategorien mit ihrem aktuell zugeordneten Produkt, im Format der Google-Sheet-BeautyNeeds-Tabelle

## Zuordnung zu den 9 Beauty-Needs-Kategorien

| Beauty Need | Produkt | Preis | Begründung |
|---|---|---|---|
| Hydration | HYALURONIC Cream Day & Night 50 ml | 72,50 € | Hyaluronsäure-Linie, explizit für Tag & Nacht |
| Barrier Repair | BETA GLUCAN Cream 24h 50 ml | 53,60 € | Beta-Glucan als barrierestärkender Wirkstoff, 24h-Pflege |
| Calming | A. MEDICAL Serum Skin Calming 30 ml | 58,80 € | Produktname explizit "Skin Calming" |
| Pigment Control | C PURE Cream Complete 50 ml | 67,90 € | Vitamin-C-Linie, klassisch für Pigmentierung |
| Sebum Balance | PSC Sebum Cleansing Lotion 125 ml | 21,60 € | "Problem Skin Care"-Linie, Produktname explizit "Sebum" |
| Texture Improvement | CLEAN & ACTIVE Micro Peeling VK 50 ml | 26,90 € | Peeling für Hautstruktur |
| Firmness | CS III Cream 50 ml | 69,90 € | "Collagen Stimulation"-Linie für Festigkeit |
| Elasticity | DIAMOND Day & Night Cream 50 ml | 99,90 € | Diamond-Linie, passend zur Deluxe-Treatment-Zuordnung |
| Radiance | CAVIAR POWER Cream Day 50 ml | 95,90 € | Caviar-Power-Linie, Glow-/Ausstrahlungspflege |

**Hinweis:** Ein Produkt pro Need ist eine Vereinfachung für den Prototyp — real bietet jede Linie mehrere Schritte (Reinigung, Tonic, Serum, Creme, Maske). Die volle Auswahl je Linie steht im Tab „Homecare-Produkte (KLAPP)" und kann bei Bedarf zu einer echten mehrstufigen Morgen-/Abendroutine ausgebaut werden (siehe Abschnitt 13, "Homecare-Routine" im Konzept).

## Wo das in der App verwendet wird

`DEFAULT_NEED_INFO` in `figma/prototype.html` — jedes der 9 Needs hat jetzt `product` (Name) und `produktpreis`. Erscheint auf dem Empfehlungs- und Beauty-Blueprint-Screen (Morgens-/Abends-Routine) sowie in der E-Mail-Zusammenfassung.
