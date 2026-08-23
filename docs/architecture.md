# Architektur

Kurzfassung des geplanten technischen Grundaufbaus (vollständiger Kontext: [Projektbeschreibung.md](Projektbeschreibung.md), Abschnitt 28).

| Baustein | Rolle |
|---|---|
| **Figma** | UX, Designsystem, klickbarer Prototyp (Phase 1, vor jeglichem Code) |
| **Flutter** | Mitarbeiter-App — iPad, iPhone, Android-Tablet, Android-Smartphone, perspektivisch Web → [`/app`](../app) |
| **Next.js** | Admin-Bereich für die Studioleitung → [`/admin`](../admin) |
| **Supabase** | Zentrale PostgreSQL-Datenbank, Anmeldung/Benutzerverwaltung, Storage, APIs, Echtzeitdaten → [`/supabase`](../supabase) |
| **Render** | Backend-Services, PDF-Erstellung, Hintergrundprozesse, künftige Integrationen |
| **GitHub** | Codeverwaltung, Versionierung, Zusammenarbeit, Deployments |

## Prinzip: eine zentrale Datenquelle

Behandlungen, Produkte, Preise, Fragen und Regeln werden ausschließlich im Admin-Bereich gepflegt (Supabase als Single Source of Truth) und stehen automatisch in der Mitarbeiter-App zur Verfügung. Keine Duplizierung von Fachwissen im Code.

## Repo-Layout

Monorepo — `app/`, `admin/` und `supabase/` liegen zusammen mit `docs/` in diesem Repository. Solange keiner dieser Teile lauffähigen Code enthält, dienen die Ordner als strukturelle Platzhalter für die spätere Umsetzung (nach Abschluss von Phase 1–4 im Rollout-Plan).
