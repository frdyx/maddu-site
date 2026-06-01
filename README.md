# maddu-site

The marketing + deep-dive site for **Máddu** — the local-first orchestration spine for AI agents.

Brand language ported from the Máddu cockpit (`maddu/template/maddu/cockpit/cockpit.css`): navy noir surfaces, lime primary accent, electric blue secondary, burnt-orange brand glyph, IBM Plex throughout.

## Stack

- Astro (static output, no SSR)
- Vanilla CSS, brand tokens at `src/styles/tokens.css`
- Mermaid.js client-side render, themed to Máddu tokens
- Zero analytics, zero third-party scripts

## Develop

```bash
npm install
bash scripts/fetch-fonts.sh   # one-time: pulls IBM Plex woff2 into public/fonts/
npm run dev                   # http://localhost:4321
npm run build                 # → dist/
npm run preview               # serve dist/
```

The font script downloads ten woff2 weights (Plex Sans 400/500/600, Plex Sans Condensed 400/500/600/700, Plex Mono 400/500/600) from the @fontsource jsDelivr mirror. After that the site is fully self-hosted — no Google Fonts call at runtime. If you skip the script, the layout has no Google fallback wired (deliberate: matches Máddu's no-third-party-network posture). System fonts take over and the page still reads cleanly.

## Structure

```
src/
  layouts/Layout.astro        shared shell (rail nav, footer, tokens)
  components/
    Mermaid.astro             mermaid.js wrapper with brand theme
    Diagram.astro             captioned diagram block
    Rule.astro                hard-rule card
    Section.astro             content section wrapper
  pages/
    index.astro               landing — hero, what/why, posture
    how-it-works.astro        canonical flow + slice loop + lanes
    architecture.astro        the full 13-layer ontology
    security.astro            worker isolation, secret scan, threat model
    governance.astro          gauntlet, tiers, approvals
    hard-rules.astro          the 8+1 in detail
    capabilities.astro        verb ontology (every command earns its place)
  styles/
    tokens.css                ported from cockpit (single source of truth here)
    base.css                  typography + layout primitives
public/
  brand-mark.svg              official Máddu glyph (burnt orange)
  brand-horizontal.svg
  favicon-32.png
  favicon.ico
```

## Deploy

Static `dist/` ships anywhere — Cloudflare Pages, GitHub Pages, Netlify, Vercel, S3+CloudFront, a static nginx box. No SSR runtime needed.

## Relationship to the framework

This is a **sibling repo** to the (currently private) `maddu` framework. The site can ship public on its own marketing cadence without coupling to the framework's release process. Brand tokens are mirrored here, not imported; they're a small enough surface to keep in sync manually, and decoupling means the site can iterate on visual language without touching the cockpit.

Source of truth for the framework copy: `docs/charter.md` in the `maddu` repo.
