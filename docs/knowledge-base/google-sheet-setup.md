# Beauty Knowledge Base als Google Sheet (Phase-1-Zwischenlösung)

Der Klickdummy ([figma/prototype.html](../../figma/prototype.html)) kann seine Fragen, Antwortoptionen und Behandlungen aus einem Google Sheet laden, statt sie fest im Code zu haben. Damit können Fragen, Ziele, Behandlungen und Produkte verändert werden, ohne dass Code angefasst wird — genau das Prinzip aus [Projektbeschreibung.md](../Projektbeschreibung.md), Abschnitt 11 und 15 ("eine zentrale Datenquelle"), nur ohne Backend-Aufwand für die Prototyp-Phase. Später übernimmt dafür Supabase + der Next.js-Admin diese Rolle (siehe [architecture.md](../architecture.md)) — dieses Sheet ist eine bewusste Zwischenlösung, kein Ersatz.

## Funktionsprinzip

Das Sheet wird über *Datei → Freigeben → Im Web veröffentlichen* pro Tabellenblatt als CSV veröffentlicht. Das ergibt eine öffentliche, aber unlistige Lese-URL ohne Login/API-Key. `prototype.html` lädt diese CSV-URLs beim Start per `fetch()` und ersetzt damit die eingebauten Beispieldaten.

**Wichtig:** "Im Web veröffentlichen" macht die Tabelle für jeden mit dem Link lesbar (kein Google-Login nötig). Für die Prototyp-Phase mit Testinhalten unkritisch — für echte Preise/interne Daten später nicht mehr verwenden, dann übernimmt der Next.js-Admin mit echter Zugriffskontrolle.

## Schritt für Schritt

1. Neues Google Sheet anlegen, sieben Tabellenblätter (Tabs) mit folgenden Namen und Kopfzeilen anlegen (Kopfzeile exakt wie unten, Kleinschreibung ist wichtig — der Code sucht nach diesen Spaltennamen).
2. Für **jedes** Tabellenblatt einzeln: *Datei → Freigeben → Im Web veröffentlichen* → im Dropdown das jeweilige Tabellenblatt auswählen (nicht "Gesamtes Dokument") → Format auf **CSV** stellen → veröffentlichen → Link kopieren.
3. Die sieben Links in `figma/prototype.html` im Objekt `SHEET_CONFIG` eintragen (ganz am Anfang des `<script>`-Blocks).
4. Datei speichern, `prototype.html` im Browser neu laden — die Karten/Fragen kommen jetzt aus dem Sheet.

Bleibt eine URL leer, nutzt der Prototyp für dieses Tabellenblatt weiter die eingebauten Beispieldaten (kein Absturz, gute Rückfalloption für einzelne Tabs).

## Tabellenblätter & Spalten

### 1. Ziele
| key | label | aktiv |
|---|---|---|
| glow | Mehr Feuchtigkeit & Glow | ja |

### 2. PainPoints
| key | label | aktiv |
|---|---|---|
| muede | Haut sieht müde aus | ja |

### 3. Anlass
| key | label | aktiv |
|---|---|---|
| hochzeit | Hochzeit | ja |

### 4. Lifestyle
| key | frage | typ | optionen | aktiv |
|---|---|---|---|---|
| sonnenschutz | Nutzt die Kundin täglich Sonnenschutz? | yesno | | ja |
| stress | Wie hoch ist ihr aktuelles Stresslevel? | scale3 | Niedrig,Mittel,Hoch | ja |

`typ` ist entweder `yesno` (Ja/Nein) oder `scale3` (drei Stufen, in `optionen` kommagetrennt).

### 5. Sicherheitscheck
| key | frage | risiko | aktiv |
|---|---|---|---|
| schwanger | Schwangerschaft oder Stillzeit? | rot | ja |
| allergien | Bekannte Allergien? | gelb | ja |

`risiko` ist `gruen`, `gelb` oder `rot` — greift, wenn die Mitarbeiterin diese Frage mit "Ja" beantwortet (siehe Sicherheitsstufen, Abschnitt 6 der Projektbeschreibung).

### 6. Hautanalyse
| key | label | need | aktiv |
|---|---|---|---|
| feuchtigkeit | Feuchtigkeitsmangel | Hydration | ja |

### 7. BeautyNeeds
| need | behandlung | dauer | preis | produkt |
|---|---|---|---|---|
| Hydration | Soft Needling meets Hyaluron | 90 Min. | 239 € | Klapp Heimpflege (individuell nach Hautanalyse) |

`dauer` und `preis` sind optional — leer lassen, wenn nicht bekannt. Echte Werte für alle 9 Kategorien: siehe [behandlungskatalog.md](behandlungskatalog.md) (Quelle: aktuelle Beauty-Lounge-Preisliste).

## Feste Beauty-Needs-Kategorien

Die Spalte `need` in **Hautanalyse** und **BeautyNeeds** muss exakt einen dieser neun Werte verwenden (Groß-/Kleinschreibung beachten) — das sind die festen Kategorien der Entscheidungslogik (Abschnitt 10 der Projektbeschreibung), nur die Zuordnung dazu ist frei editierbar:

`Hydration` · `Barrier Repair` · `Calming` · `Pigment Control` · `Sebum Balance` · `Texture Improvement` · `Firmness` · `Elasticity` · `Radiance`

Neue Behandlungen oder Hautanalyse-Parameter lassen sich also jederzeit ergänzen, solange sie einer dieser neun Kategorien zugeordnet werden — ganz ohne Programmierung, genau wie in Abschnitt 10 beschrieben.

## Zeilen aktiv/inaktiv schalten

Die Spalte `aktiv` (nicht bei BeautyNeeds) steuert, ob eine Zeile im Prototyp erscheint. Werte `ja`/`true`/`1` (oder leer) = aktiv, alles andere = ausgeblendet. So lassen sich Fragen oder Ziele testweise deaktivieren, ohne die Zeile zu löschen.
