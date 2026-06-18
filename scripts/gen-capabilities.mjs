// gen-capabilities.mjs — compose the 62 per-verb entity pages' data from the
// framework's three canonical sources. Mirrors `maddu audit capability-docs`:
// the verb set comes from docs/capability-docs.json (the audited map), purpose
// + domain from docs/charter.md, and the CLI surface from docs/03-cli-reference.md.
//
// Output: src/data/capabilities-detail.json (committed). The build re-reads the
// framework files when present; on CI (framework repo absent) it no-ops and the
// committed file is used — so the site stays in sync by regenerating, never by
// hand-maintaining a parallel list.
//
//   Usage:  node scripts/gen-capabilities.mjs   (set MADDU_REPO to override path)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, '..');
const MADDU = process.env.MADDU_REPO ? resolve(process.env.MADDU_REPO) : resolve(siteRoot, '..', 'maddu');
const OUT = join(siteRoot, 'src', 'data', 'capabilities-detail.json');

// Where the deep-dive docs are published. Update if/when the docs move to a
// hosted site; until then the canonical home is the framework repo on GitHub.
const DOCS_BASE_URL = 'https://github.com/frdyx/maddu/blob/main';

const CHARTER = join(MADDU, 'docs', 'charter.md');
const CLI = join(MADDU, 'docs', '03-cli-reference.md');
const CAPDOCS = join(MADDU, 'docs', 'capability-docs.json');

if (![CHARTER, CLI, CAPDOCS].every(existsSync)) {
  console.log(`[gen-capabilities] framework repo not found at ${MADDU} — keeping committed ${OUT.replace(siteRoot + '\\', '').replace(siteRoot + '/', '')}`);
  process.exit(0);
}

// Stable map from charter domain title → the area id used in capabilities.astro
// (for cross-linking back to the right card). A new/renamed domain falls back
// to a slug and surfaces as a warning below.
const DOMAIN_ID = {
  'Orchestration core': 'orchestration',
  'Planning & autonomy': 'planning',
  'Quality & review': 'quality',
  'Default tools': 'tools',
  'Supply-chain & trust': 'trust',
  'Memory & accounting': 'memory',
  'Discovery & observability': 'discovery',
  'Lifecycle & plumbing': 'lifecycle',
};

const stripTicks = (s) => s.replace(/`/g, '');
const flattenMd = (s) =>
  s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [txt](url) → txt
   .replace(/\*\*([^*]+)\*\*/g, '$1')       // **bold** → bold
   .replace(/`/g, '')                        // inline code ticks
   .replace(/\s+/g, ' ')
   .trim();

// ── 1. charter.md → domain + purpose + per-verb tagline ──────────────────
const charterMd = readFileSync(CHARTER, 'utf8');
const charterByVerb = {};
for (const line of charterMd.split(/\r?\n/)) {
  if (!line.startsWith('|')) continue;
  const cells = line.split('|').map((c) => c.trim());
  cells.shift(); // leading ''
  if (cells.length && cells[cells.length - 1] === '') cells.pop(); // trailing ''
  if (cells.length < 3) continue;
  const domain = cells[0];
  const verbsCell = cells[1];
  const purposeRaw = cells.slice(2).join(' | ');
  if (!DOMAIN_ID[domain]) continue; // header / separator / unknown domain
  const verbs = [...verbsCell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  if (!verbs.length) continue;
  const verbSet = new Set(verbs);
  const tokens = [...purposeRaw.matchAll(/`([^`]+)`/g)];
  for (const v of verbs) {
    charterByVerb[v] = {
      domain,
      domainId: DOMAIN_ID[domain],
      domainPurpose: flattenMd(purposeRaw),
      tagline: taglineFor(purposeRaw, tokens, verbSet, v),
    };
  }
}

// Best-effort per-verb clause from the domain purpose: the text from this verb's
// backtick mention up to the next *verb* mention (descriptive backticks ignored).
function taglineFor(purposeRaw, tokens, verbSet, verb) {
  const i = tokens.findIndex((t) => t[1] === verb);
  if (i < 0) return null; // listed but not elaborated inline
  const start = tokens[i].index + tokens[i][0].length;
  let end = purposeRaw.length;
  for (let j = i + 1; j < tokens.length; j++) {
    if (verbSet.has(tokens[j][1])) { end = tokens[j].index; break; }
  }
  let frag = flattenMd(purposeRaw.slice(start, end))
    .replace(/^['’]s\s+/, '')          // strip a leading possessive ("'s drift check" → "drift check")
    .replace(/^[\s,;:.—-]+/, '')
    .replace(/^(and|the)\s+/i, '')
    .replace(/[\s,;]+$/, '');
  if (frag.length > 200) frag = frag.slice(0, 200).replace(/\s\S*$/, '') + '…';
  return frag || null;
}

// ── 2. 03-cli-reference.md → per-verb CLI surface ────────────────────────
const cliMd = readFileSync(CLI, 'utf8');
const cliByVerb = {};
{
  const lines = cliMd.split(/\r?\n/);
  let cur = null;
  const flush = () => {
    if (!cur) return;
    const blocks = [];
    const intro = [];   // prose before the first code block
    const notes = [];   // prose after the code block(s)
    let inFence = false;
    let seenBlock = false;
    let buf = [];
    for (const l of cur.body) {
      if (l.trim().startsWith('```')) {
        if (inFence) { blocks.push(buf.join('\n').trim()); buf = []; inFence = false; seenBlock = true; }
        else { inFence = true; }
        continue;
      }
      if (inFence) buf.push(l);
      else if (l.trim()) (seenBlock ? notes : intro).push(l.trim());
    }
    const sinceBody = cur.body.join(' ').match(/\*\(\s*(v\d+(?:\.\d+)*)/);
    const cleanNotes = flattenMd(notes.join(' ')).replace(/\*?\(v[\d.]+[^)]*\)\*?\.?\s*$/, '').trim();
    if (!cliByVerb[cur.verb]) {
      cliByVerb[cur.verb] = {
        since: cur.since || (sinceBody ? sinceBody[1] : null),
        intro: flattenMd(intro.join(' ')) || null,
        notes: cleanNotes || null,
        blocks,
      };
    }
    cur = null;
  };
  for (const l of lines) {
    const h = l.match(/^##\s+`maddu ([a-z-]+)[^`]*`(.*)$/);
    if (h) {
      flush();
      const sinceMatch = (h[2] || '').match(/v\d+(?:\.\d+)*/);
      cur = { verb: h[1], since: sinceMatch ? sinceMatch[0] : null, body: [] };
    } else if (l.match(/^#{1,2}\s+\S/) && cur) {
      flush(); // a new top-level/section header ends the current verb block
    } else if (cur) {
      cur.body.push(l);
    }
  }
  flush();
}

// ── 3. capability-docs.json → deep-dive link (the audited 62-verb set) ────
const capDocs = JSON.parse(readFileSync(CAPDOCS, 'utf8'));
const verbKeys = Object.keys(capDocs.verbs).sort();

// First sentence of a prose blob — used to turn the CLI intro into a tight lead.
function firstSentence(s) {
  if (!s) return null;
  const m = s.match(/^(.*?[.!?])(\s|$)/);
  let out = (m ? m[1] : s).trim();
  out = out.replace(/\s*See\s+\d[\w.-]+\.md\.?$/i, '').trim(); // drop a trailing "See NN-foo.md"
  return out || null;
}

// ── compose + drift checks (mirror `maddu audit capability-docs`) ────────
const warnings = [];
const verbs = verbKeys.map((verb) => {
  const ch = charterByVerb[verb] || null;
  if (!ch) warnings.push(`charter has no domain row for "${verb}"`);
  const cli = cliByVerb[verb] || null;
  const docFile = capDocs.verbs[verb];
  const deepDive = docFile
    ? { file: docFile, url: `${DOCS_BASE_URL}/${capDocs.docsDir}/${docFile}` }
    : null;
  const rawSummary = firstSentence(cli?.intro) || (ch ? ch.tagline : null);
  const summary = rawSummary ? rawSummary.charAt(0).toUpperCase() + rawSummary.slice(1) : null;
  return {
    verb,
    domain: ch?.domain ?? null,
    domainId: ch?.domainId ?? null,
    domainPurpose: ch?.domainPurpose ?? null,
    summary,
    since: cli?.since ?? null,
    cliIntro: cli?.intro ?? null,
    cliBlocks: cli?.blocks ?? [],
    cliNotes: cli?.notes ?? null,
    deepDive,
  };
});

for (const v of Object.keys(charterByVerb)) {
  if (!(v in capDocs.verbs)) warnings.push(`charter verb "${v}" is missing from capability-docs.json`);
}
if (warnings.length) {
  console.warn('[gen-capabilities] drift detected:\n  - ' + warnings.join('\n  - '));
}

const payload = {
  schemaVersion: 1,
  generatedFrom: ['docs/charter.md', 'docs/03-cli-reference.md', 'docs/capability-docs.json'],
  docsBaseUrl: DOCS_BASE_URL,
  total: verbs.length,
  withCli: verbs.filter((v) => v.cliBlocks.length).length,
  withDeepDive: verbs.filter((v) => v.deepDive).length,
  verbs,
};

writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');
console.log(`[gen-capabilities] wrote ${verbs.length} verbs → src/data/capabilities-detail.json (${payload.withCli} with CLI blocks, ${payload.withDeepDive} with deep-dive)`);
