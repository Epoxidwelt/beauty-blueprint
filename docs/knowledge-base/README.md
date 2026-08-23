# Beauty Knowledge Base

Platzhalter für die zentrale, code-unabhängige Wissensbasis (siehe [Projektbeschreibung.md](../Projektbeschreibung.md), Abschnitt 11–13). Soll strukturiert enthalten:

- Kundenziele & Pain Points
- Hautbedürfnisse (Beauty Needs)
- Hautzustände & Bewertungsskalen
- Behandlungskatalog (Stammdaten, fachliche Zuordnung, Strategie, Verknüpfungen)
- Produktkatalog
- Kontraindikationen & Sicherheitsstufen (Grün/Gelb/Rot)
- Regeln der Entscheidungs-Engine
- Programme & Phasen (Signature Programs)

**Status:** Für die Prototyp-Phase wird die Knowledge Base testweise als **Google Sheet** gepflegt (7 Tabs für Ziele, Pain Points, Anlass, Lifestyle, Sicherheitscheck, Hautanalyse und Beauty-Needs-Zuordnung), das der Klickdummy per CSV-Export direkt lädt — siehe [google-sheet-setup.md](google-sheet-setup.md) für Aufbau und Anleitung. Nach Validierung des Figma-Prototyps (Phase 1–4) wandert dieselbe Struktur ins Supabase-Schema und den Next.js-Admin — das ist laut Konzept (Abschnitt 39) das eigentliche geistige Eigentum des Projekts, nicht die Benutzeroberfläche.
