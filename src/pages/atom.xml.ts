// atom.xml — feed reader endpoint for the changelog.
// Atom 1.0 (RFC 4287). Sourced from the shared RELEASES list so the
// Atom feed, the JSON feed, the /api endpoint, and /changelog never
// drift.

import type { APIRoute } from 'astro';
import { RELEASES } from '../data/releases';

const SITE = 'https://maddu.dev';

function isoDay(d: string) {
  return d + 'T00:00:00Z';
}

function xmlEscape(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = () => {
  const newest = RELEASES[0];
  const updated = isoDay(newest.date);
  const buildId = new Date().toISOString().slice(0, 10);

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">\n' +
    `  <id>${SITE}/changelog</id>\n` +
    `  <title>Máddu changelog</title>\n` +
    `  <subtitle>A local-first orchestration spine for AI agents — release history.</subtitle>\n` +
    `  <link href="${SITE}/atom.xml" rel="self" type="application/atom+xml" />\n` +
    `  <link href="${SITE}/feed.json" rel="alternate" type="application/feed+json" />\n` +
    `  <link href="${SITE}/changelog" rel="alternate" type="text/html" />\n` +
    `  <updated>${updated}</updated>\n` +
    `  <generator uri="${SITE}">maddu-site</generator>\n` +
    `  <icon>${SITE}/brand-mark.svg</icon>\n` +
    `  <logo>${SITE}/brand-horizontal.svg</logo>\n` +
    RELEASES.map(
      (r) =>
        `  <entry>\n` +
        `    <id>${SITE}/changelog/${r.id}</id>\n` +
        `    <title>${xmlEscape(`${r.v} — ${r.headline}`)}</title>\n` +
        `    <link href="${SITE}/changelog/${r.id}" rel="alternate" type="text/html" />\n` +
        `    <updated>${isoDay(r.date)}</updated>\n` +
        `    <published>${isoDay(r.date)}</published>\n` +
        `    <category term="${r.type}" label="${r.type.charAt(0).toUpperCase() + r.type.slice(1)}" />\n` +
        `    <summary type="text">${xmlEscape(r.summary)}</summary>\n` +
        `  </entry>`
    ).join('\n') +
    '\n</feed>\n';

  return new Response(body, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, must-revalidate',
      'X-Build': buildId,
    },
  });
};
