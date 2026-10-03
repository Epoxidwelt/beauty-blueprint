# Hosting mit Cloudflare Pages + Zugangsschutz

Stand: 04.10.2026 · kostenlos (Pages + Cloudflare Access bis 50 Nutzer) · Dauer ca. 30 Minuten

## Was ist vorbereitet (von mir)
- `scripts/build-pages.sh` baut den Ordner `dist/` (Seite als `index.html`, Bilder, Sicherheits-Header, `robots.txt` = nicht für Suchmaschinen).
- Kamera-Scan ist erlaubt (`Permissions-Policy: camera=(self)`), alles andere gesperrt; nur HTTPS (macht Cloudflare automatisch).
- Bei jedem Git-Push baut Cloudflare automatisch neu.

## Was du tust
### 1. Konto und Projekt
1. **dash.cloudflare.com** → Konto anlegen (Studio-E-Mail) → *Workers & Pages* → **Create → Pages → Connect to Git**.
2. GitHub verbinden → Repository **Epoxidwelt/beauty-blueprint** wählen.
3. Einstellungen:
   - **Production branch:** `main`
   - **Build command:** `bash scripts/build-pages.sh`
   - **Build output directory:** `dist`
4. **Save and Deploy**. Danach hast du eine Adresse wie `beauty-lounge-bestellung.pages.dev`.

### 2. Zugangsschutz (wichtig, bevor jemand die Adresse nutzt)
1. Cloudflare → **Zero Trust** (kostenlosen Plan wählen) → **Access → Applications → Add an application → Self-hosted**.
2. Name: `Beauty Lounge Bestellung`, Domain: deine `…pages.dev`-Adresse (auch die Vorschau-Adressen `*.…pages.dev` schützen).
3. **Policy:** Aktion *Allow*, Regel *Emails* → die E-Mail-Adressen der Mitarbeiterinnen eintragen.
4. Anmeldung per **einmaligem Code per E-Mail** (One-time PIN) — kein Passwort nötig; Sitzungsdauer z. B. 24 Stunden.

### 3. iPad / Handy
Adresse öffnen → Anmelden → Teilen → **„Zum Home-Bildschirm"** → startet wie eine App. Die Kamera-Freigabe einmal erlauben.

## Zwei Schutzebenen
1. **Cloudflare Access:** nur eingeladene E-Mail-Adressen kommen überhaupt auf die Seite.
2. **Supabase-Anmeldung** (E-Mail + PIN): nur Mitarbeiterinnen mit Profil dürfen Daten lesen/schreiben; Preise nur die Inhaberin.

## Nach dem Veröffentlichen
- Update einspielen = Änderung in GitHub pushen (ich mache das), Cloudflare baut in ~1 Minute neu.
- Wichtig: Der bisherige Prototyp-Link (Artifact) wird nicht mehr gebraucht und nicht weitergegeben.
