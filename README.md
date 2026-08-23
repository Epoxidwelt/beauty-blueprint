# Beauty Blueprint™ by Beauty Lounge

> Persönliche Hautanalyse. Klare Strategie. Sichtbare Ergebnisse.

Ein digitales Beratungssystem ("Consultation Operating System") für Mitarbeiterinnen von Kosmetikinstituten. Die App führt Mitarbeiterinnen strukturiert durch eine Beauty- und Hautberatung — von Ziel und Pain Point über Sicherheitscheck und Fachanalyse bis zur individuellen Strategie und Behandlungs-/Produktempfehlung. Kundinnen bedienen die App nicht selbst; sie ist ein Werkzeug für die beratende Mitarbeiterin.

Das vollständige Konzept: [docs/Projektbeschreibung.md](docs/Projektbeschreibung.md)

## Status

**Phase 1 — Figma-Prototyp.** Laut Rollout-Plan (siehe Konzept, Abschnitt 32) wird zuerst ein klickbarer High-Fidelity-Prototyp in Figma gebaut und mit echten Testberatungen validiert, bevor lauffähige Software entwickelt wird. Dieses Repo enthält aktuell nur die geplante Projektstruktur als Platzhalter — noch keinen Anwendungscode.

## Struktur

| Ordner | Zweck |
|---|---|
| [`docs/`](docs) | Konzept, Architekturnotizen, künftige Knowledge-Base-Struktur |
| [`figma/`](figma) | Ablage/Links zum klickbaren Prototyp (Phase 1) |
| [`app/`](app) | Künftige Flutter-Mitarbeiter-App (iPad/iPhone/Android) |
| [`admin/`](admin) | Künftiger Next.js-Admin-Bereich |
| [`supabase/`](supabase) | Künftiges Datenbankschema, Migrations, Auth-Konfiguration |

## Geplanter Stack

Figma (Design/Prototyp) · Flutter (Mitarbeiter-App) · Next.js (Admin) · Supabase (DB/Auth/Storage/Realtime) · Render (Backend-Services, PDF-Erstellung) · GitHub (Versionierung)

Details: [docs/architecture.md](docs/architecture.md)
