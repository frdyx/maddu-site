#!/usr/bin/env bash
# fetch-fonts.sh — downloads the IBM Plex weights this site uses from
# the @fontsource CDN (jsDelivr). Run from the repo root:
#
#     bash scripts/fetch-fonts.sh
#
# Falls back gracefully: if a download fails, the @font-face decl in
# tokens.css still uses the Google Fonts fallback declared on the
# layout. Re-run any time to refresh.

set -euo pipefail

OUT="public/fonts"
mkdir -p "$OUT"

# Source: fontsource (https://fontsource.org). Stable, MIT-licensed,
# served from jsDelivr. Each weight is one woff2 file, latin subset only
# (matches the site's English-only content; ~15KB per weight gzipped).
declare -a FILES=(
  # IBM Plex Sans — 400, 500, 600
  "ibm-plex-sans@5.0.13/files/ibm-plex-sans-latin-400-normal.woff2|plex-sans-400.woff2"
  "ibm-plex-sans@5.0.13/files/ibm-plex-sans-latin-500-normal.woff2|plex-sans-500.woff2"
  "ibm-plex-sans@5.0.13/files/ibm-plex-sans-latin-600-normal.woff2|plex-sans-600.woff2"
  # IBM Plex Sans Condensed — 400, 500, 600, 700
  "ibm-plex-sans-condensed@5.0.13/files/ibm-plex-sans-condensed-latin-400-normal.woff2|plex-cond-400.woff2"
  "ibm-plex-sans-condensed@5.0.13/files/ibm-plex-sans-condensed-latin-500-normal.woff2|plex-cond-500.woff2"
  "ibm-plex-sans-condensed@5.0.13/files/ibm-plex-sans-condensed-latin-600-normal.woff2|plex-cond-600.woff2"
  "ibm-plex-sans-condensed@5.0.13/files/ibm-plex-sans-condensed-latin-700-normal.woff2|plex-cond-700.woff2"
  # IBM Plex Mono — 400, 500, 600
  "ibm-plex-mono@5.0.13/files/ibm-plex-mono-latin-400-normal.woff2|plex-mono-400.woff2"
  "ibm-plex-mono@5.0.13/files/ibm-plex-mono-latin-500-normal.woff2|plex-mono-500.woff2"
  "ibm-plex-mono@5.0.13/files/ibm-plex-mono-latin-600-normal.woff2|plex-mono-600.woff2"
)

BASE="https://cdn.jsdelivr.net/npm/@fontsource"
got=0; fail=0
for entry in "${FILES[@]}"; do
  src="${entry%|*}"
  dst="${entry#*|}"
  url="$BASE/$src"
  path="$OUT/$dst"
  if curl -fsSL "$url" -o "$path"; then
    printf '  ✓ %s\n' "$dst"
    got=$((got + 1))
  else
    printf '  ✗ %s  (will use Google Fonts fallback)\n' "$dst"
    fail=$((fail + 1))
  fi
done

echo
echo "  $got downloaded, $fail failed → $OUT/"
echo "  If anything failed, the layout falls back to Google Fonts at runtime."
