// sitemap.xml — generated at build time.
// Hand-maintained because the site is small and deep-link anchors matter.
// Order = reading order (mirrors PageNext arc).

import type { APIRoute } from 'astro';
import { RELEASES } from '../data/releases';
import capDetail from '../data/capabilities-detail.json';

const SITE = 'https://maddu.frdyx.com';

const PAGES = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/features', priority: 0.9, changefreq: 'monthly' },
  { path: '/how-it-works', priority: 0.9, changefreq: 'monthly' },
  { path: '/architecture', priority: 0.9, changefreq: 'monthly' },
  { path: '/security', priority: 0.9, changefreq: 'monthly' },
  { path: '/threat-model', priority: 0.9, changefreq: 'monthly' },
  { path: '/governance', priority: 0.8, changefreq: 'monthly' },
  { path: '/hard-rules', priority: 0.8, changefreq: 'monthly' },
  { path: '/capabilities', priority: 0.8, changefreq: 'monthly' },
  { path: '/install', priority: 0.7, changefreq: 'weekly' },
  { path: '/changelog', priority: 0.6, changefreq: 'weekly' },
  { path: '/manifesto', priority: 0.8, changefreq: 'monthly' },
];

// Feature landing pages — the marketing layer over the capability docs.
const FEATURE_SLUGS = ['discipline', 'worktrees', 'autonomy', 'learn', 'fleet', 'ci', 'focus', 'cost'];
for (const f of FEATURE_SLUGS) {
  PAGES.push({ path: '/features/' + f, priority: 0.8, changefreq: 'monthly' });
}

// Comparison pages — the honest landscape map + per-matchup pages.
PAGES.push({ path: '/compare', priority: 0.9, changefreq: 'monthly' });
const COMPARE_SLUGS = ['claude-code', 'codex-cli', 'paperclip', 'orchestrators', 'langgraph', 'langfuse', 'temporal', 'enterprise'];
for (const c of COMPARE_SLUGS) {
  PAGES.push({ path: '/compare/' + c, priority: 0.7, changefreq: 'monthly' });
}

// Per-release stub pages — emitted but flagged noindex (release context
// lives on /changelog itself); included here so sitemap crawlers can
// discover the deep-link URLs for the social cards. Derived from the
// canonical RELEASES list so it never drifts as releases are added.
for (const r of RELEASES) {
  PAGES.push({ path: '/changelog/' + r.id, priority: 0.3, changefreq: 'yearly' });
}

// Per-verb capability entity pages — derived from the audited capability
// detail map (scripts/gen-capabilities.mjs), so all 66 stay discoverable
// and the list never has to be hand-maintained.
for (const v of capDetail.verbs) {
  PAGES.push({ path: '/capabilities/' + v.verb, priority: 0.5, changefreq: 'monthly' });
}

const MANIFESTO_SLUGS = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
for (const slug of MANIFESTO_SLUGS) {
  PAGES.push({ path: '/manifesto/' + slug, priority: 0.3, changefreq: 'monthly' });
}

// /brand and /privacy weren't in the original list — wire them now.
PAGES.push({ path: '/brand',   priority: 0.5, changefreq: 'monthly' });
PAGES.push({ path: '/privacy', priority: 0.4, changefreq: 'yearly' });

export const GET: APIRoute = () => {
  const today = new Date().toISOString().slice(0, 10);
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    PAGES.map(
      (p) =>
        `  <url>\n` +
        `    <loc>${SITE}${p.path}</loc>\n` +
        `    <lastmod>${today}</lastmod>\n` +
        `    <changefreq>${p.changefreq}</changefreq>\n` +
        `    <priority>${p.priority.toFixed(1)}</priority>\n` +
        `  </url>`
    ).join('\n') +
    '\n</urlset>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
