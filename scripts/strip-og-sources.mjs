// strip-og-sources.mjs — post-build cleanup. Removes the .svg sources
// from dist/og/ so only the .png cards ship. Sources stay in public/
// for regeneration; the build output keeps just what social crawlers
// need. Saves ~3MB on the deploy.

import { rmSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const distOg = resolve(here, '..', 'dist', 'og');

let removed = 0;
let kept = 0;

function walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    const p = resolve(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) {
      walk(p);
    } else if (name.endsWith('.svg')) {
      rmSync(p);
      removed++;
    } else {
      kept++;
    }
  }
}

walk(distOg);
console.log(`  ✓ stripped ${removed} OG svg sources from dist/og/ (${kept} png cards kept)`);
