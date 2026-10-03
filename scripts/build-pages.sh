#!/usr/bin/env bash
# Baut den veröffentlichungsfertigen Ordner "dist" für Cloudflare Pages (kein Framework nötig).
# Cloudflare Pages: Build command = bash scripts/build-pages.sh · Output directory = dist
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist/assets
cp -R assets/logo dist/assets/logo
cp -R assets/team dist/assets/team
# Bilder liegen im Prototyp unter ../assets/… → im veröffentlichten Ordner unter assets/…
sed 's#\.\./assets/#assets/#g' figma/prototype.html > dist/index.html
cat > dist/_headers <<'HDR'
/*
  X-Robots-Tag: noindex, nofollow
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  X-Frame-Options: DENY
  Permissions-Policy: camera=(self), microphone=(), geolocation=()
/index.html
  Cache-Control: no-cache
HDR
printf 'User-agent: *\nDisallow: /\n' > dist/robots.txt
echo "dist/ fertig: $(du -sh dist | cut -f1)"
