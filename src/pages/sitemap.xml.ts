// sitemap.xml — generated at build time.
// Hand-maintained because the site is small and deep-link anchors matter.
// Order = reading order (mirrors PageNext arc).

import type { APIRoute } from 'astro';

const SITE = 'https://maddu.dev';

const PAGES = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
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

// Per-release stub pages — emitted but flagged noindex (release context
// lives on /changelog itself); included here so sitemap crawlers can
// discover the deep-link URLs for the social cards.
const RELEASE_SLUGS = [
  'v1-3-0', 'v1-2-3', 'v1-2-2', 'v1-2-1', 'v1-2-0',
  'v1-1-2', 'v1-1-1', 'v1-1-0',
  'v1-0-5', 'v1-0-4', 'v1-0-3', 'v1-0-2', 'v1-0-1', 'v1-0-0',
  'v0-19-2', 'v0-19-1', 'v0-19-0', 'v0-18-0', 'v0-17-1',
];
for (const slug of RELEASE_SLUGS) {
  PAGES.push({ path: '/changelog/' + slug, priority: 0.3, changefreq: 'yearly' });
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
