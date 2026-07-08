// feed.json — JSON Feed 1.1 (https://www.jsonfeed.org/version/1.1/).
// Modern alternative to Atom. Most current feed readers prefer it.

import type { APIRoute } from 'astro';
import { RELEASES } from '../data/releases';

const SITE = 'https://maddu.frdyx.com';

export const GET: APIRoute = () => {
  const newest = RELEASES[0];

  const body = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Máddu changelog',
    home_page_url: `${SITE}/changelog`,
    feed_url: `${SITE}/feed.json`,
    description: 'The cooperative governance layer for AI coding agents — release history.',
    icon: `${SITE}/brand-mark.svg`,
    favicon: `${SITE}/favicon-32.png`,
    language: 'en',
    authors: [{ name: 'Máddu' }],
    items: RELEASES.map((r) => ({
      id: `${SITE}/changelog/${r.id}`,
      url: `${SITE}/changelog/${r.id}`,
      title: `${r.v} — ${r.headline}`,
      content_text: r.summary,
      summary: r.summary,
      date_published: `${r.date}T00:00:00Z`,
      tags: [r.type],
      image: `${SITE}/og/changelog/${r.id}.png`,
    })),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 'public, max-age=300, must-revalidate',
    },
  });
};
