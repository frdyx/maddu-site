// /api/changelog.json — raw release data for programmatic integration.
// For dashboards, notification systems, anyone wiring Máddu releases
// into their own tooling. Stable shape: changes here are breaking.

import type { APIRoute } from 'astro';
import { RELEASES } from '../../data/releases';

const SITE = 'https://maddu.dev';

interface ApiRelease {
  version: string;
  id: string;
  date: string;
  type: string;
  headline: string;
  summary: string;
  url: string;
  og_image: string;
}

export const GET: APIRoute = () => {
  const items: ApiRelease[] = RELEASES.map((r) => ({
    version: r.v,
    id: r.id,
    date: r.date,
    type: r.type,
    headline: r.headline,
    summary: r.summary,
    url: `${SITE}/changelog/${r.id}`,
    og_image: `${SITE}/og/changelog/${r.id}.png`,
  }));

  const body = {
    schema: 'maddu-changelog-1',
    generator: 'maddu-site',
    generated_at: new Date().toISOString(),
    count: items.length,
    latest: items[0]?.version,
    items,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'X-API-Schema': 'maddu-changelog-1',
    },
  });
};
