# Deploy

The site builds to a static `dist/` and ships to Cloudflare Pages. Two paths: GitHub Action (recommended), or manual `wrangler` from your laptop.

## One-time setup

1. **Create the Cloudflare Pages project** (in the dashboard, or via CLI):

   ```bash
   npx wrangler pages project create maddu-site --production-branch=main
   ```

2. **Issue an API token** in the Cloudflare dashboard with `Cloudflare Pages — Edit` scope, then add two secrets to the GitHub repo:

   - `CLOUDFLARE_API_TOKEN` — the token from step 2
   - `CLOUDFLARE_ACCOUNT_ID` — found in the Cloudflare dashboard sidebar

3. **(Optional)** bind a custom domain to the Pages project. Cloudflare Pages handles TLS automatically.

## Automatic — GitHub Action

`.github/workflows/deploy.yml` runs on every push to `main`:

- Installs deps with `npm ci`
- Runs `bash scripts/fetch-fonts.sh` (pulls 10 IBM Plex woff2s into `public/fonts/`)
- Builds with `npm run build`
- Deploys `dist/` via `cloudflare/wrangler-action@v3`

PRs build (to validate) but don't deploy. Only pushes to `main` ship.

Concurrency is set so a new push cancels an in-flight build on the same branch — no racing deploys.

## Manual — local wrangler

If you want to deploy from your laptop:

```bash
npm ci
bash scripts/fetch-fonts.sh
npm run build
npx wrangler login                          # one-time, opens browser
npx wrangler pages deploy dist --project-name=maddu-site --branch=main
```

## Headers + caching

`public/_headers` declares cache rules per asset class:

| Path | Cache-Control |
|---|---|
| `/_astro/*` (hashed bundles) | `public, max-age=31536000, immutable` |
| `/fonts/*` | `public, max-age=31536000, immutable` |
| `/brand-*.svg` | `public, max-age=86400` |
| `*.html` | `public, max-age=0, must-revalidate` (always fresh) |

Plus security headers (`X-Frame-Options: DENY`, strict referrer policy, locked-down permissions policy, HSTS).

## Redirects

`public/_redirects` carries a couple of defensive pretty-URL redirects. None currently load-bearing — they're scaffolded for when external deep-link shapes show up.

## Things to check after first deploy

- [ ] All 8 pages reachable: `/`, `/how-it-works`, `/architecture`, `/security`, `/threat-model`, `/governance`, `/hard-rules`, `/capabilities`
- [ ] Fonts load from `/fonts/*` (Network tab, no requests to `fonts.googleapis.com` or `fonts.gstatic.com`)
- [ ] Mermaid diagrams render with color (substrate loop, architecture ontology, gauntlet, security boundary)
- [ ] Scroll-spy works on `/architecture` and `/threat-model` (right rail follows scroll)
- [ ] PageNext footers land correctly
- [ ] `X-Frame-Options: DENY` set on responses (`curl -I https://maddu.dev/` should show it)
