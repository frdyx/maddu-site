// extract-headings.mjs — post-build scan of dist/**/*.html for every
// <h2> / <h3> that carries an id (auto-injected by Layout's heading
// anchor script at runtime; here we re-extract them from the static
// markup to seed the search palette with deep-link entries without
// requiring per-page hand-curation).
//
// Astro's Layout adds heading ids on the client. Some headings already
// have ids in the source (e.g. /architecture#spine). We pick up both
// pre-set ids and slug-derived ones for headings inside any <section>.
//
// Output: dist/search-headings.json — array of SearchEntry-shaped rows
// the palette lazy-fetches on first open.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const distRoot = resolve(here, '..', 'dist');

// Pages whose headings we DON'T want to index (stubs, errors, brand
// chrome — they'd add noise without value).
const SKIP = /^(404|changelog\/v|manifesto\/(i|ii|iii|iv|v|vi|vii))/;

// Map slug ("how-it-works/index.html") → display route name for the
// "· in ROUTE" suffix shown in palette rows.
function routeFor(htmlPath) {
  const rel = relative(distRoot, htmlPath).replace(/\\/g, '/').replace(/\/index\.html$/, '');
  return {
    url: '/' + rel.replace(/^index$/, ''),
    slug: rel || 'index',
  };
}

function slugify(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function readableRoute(slug) {
  if (slug === 'index' || slug === '') return 'Overview';
  return slug
    .split('/')
    .pop()
    .replace(/-/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = resolve(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const entries = [];

for (const html of walk(distRoot)) {
  const { url, slug } = routeFor(html);
  if (SKIP.test(slug)) continue;

  const body = readFileSync(html, 'utf8');
  const route = readableRoute(slug);

  // Cheap regex extraction — fine for static HTML with predictable shape.
  // Match <h2> or <h3> tags with optional id attribute.
  const re = /<h([23])(?:\s+[^>]*?id=["']([^"']+)["'])?[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m;
  while ((m = re.exec(body))) {
    const tag = m[1];
    let id = m[2];
    const rawText = m[3]
      .replace(/<[^>]+>/g, '')              // strip nested spans, anchor links
      .replace(/\s+/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&[a-z]+;/g, '')
      .trim();
    if (!rawText || rawText.length > 120) continue;
    if (/heading anchor/i.test(rawText)) continue;
    if (!id) id = slugify(rawText);
    if (!id) continue;

    entries.push({
      kind: 'sub',
      title: rawText,
      url: url + '#' + id,
      group: tag === '2' ? 'heading' : 'section',
      targetRoute: route,
      keywords: rawText.toLowerCase() + ' ' + route.toLowerCase(),
    });
  }
}

// De-dupe by (url, title).
const seen = new Set();
const unique = entries.filter((e) => {
  const k = e.url + '|' + e.title;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

writeFileSync(resolve(distRoot, 'search-headings.json'), JSON.stringify(unique));
console.log('  ✓ wrote ' + unique.length + ' heading entries → dist/search-headings.json');
