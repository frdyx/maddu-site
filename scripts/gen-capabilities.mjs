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

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
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
    .replace(/^(is|are)\s+(the\s+)?/i, '') // "is the read-only fleet view" → "read-only fleet view"
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
    // Verbs are documented at h2 (`## \`maddu lane\``) and, since v1.2.0, at
    // h3 inside grouped release sections (`### \`maddu autonomy\` *(v1.92.0)*`).
    // Matching only h2 silently dropped every newer verb's CLI surface.
    const h = l.match(/^#{2,3}\s+`maddu ([a-z-]+)[^`]*`(.*)$/);
    if (h) {
      flush();
      const sinceMatch = (h[2] || '').match(/v\d+(?:\.\d+)*/);
      cur = { verb: h[1], since: sinceMatch ? sinceMatch[0] : null, body: [] };
    } else if (l.match(/^#{1,3}\s+\S/) && cur) {
      flush(); // a new header at any level ends the current verb block
    } else if (cur) {
      cur.body.push(l);
    }
  }
  flush();
}

// ── 2b. harvest per-verb commands from every code fence ──────────────────
// The release-grouped sections ("## v1.1.0 commands", "## Experience &
// evolution") document eight-plus verbs inside one shared code block, under a
// heading that names no verb at all. Walking the fences and bucketing each
// `$ maddu <verb> …` line by its verb recovers a real CLI surface for them.
function harvestFences(md) {
  const cmds = {};   // verb → command lines, in document order
  const notes = {};  // verb → trailing `# …` comment on its first line
  let inFence = false;
  let pending = [];     // a comment run that heads the *next* command
  let lastVerb = null;  // set while comment lines still trail a command
  for (const l of md.split(/\r?\n/)) {
    const t = l.trim();
    if (t.startsWith('```')) { inFence = !inFence; pending = []; lastVerb = null; continue; }
    if (!inFence) continue;
    if (!t) { pending = []; lastVerb = null; continue; }

    const m = t.match(/^\$?\s*maddu\s+([a-z-]+)\b/);
    if (m) {
      const verb = m[1];
      (cmds[verb] ||= []).push(...pending, l);
      pending = [];
      lastVerb = verb;
      const trailing = t.match(/\s#\s*(.+)$/);
      if (trailing && !notes[verb]) notes[verb] = trailing[1].trim();
    } else if (t.startsWith('#')) {
      // A comment run touching the command above continues it; one that
      // follows a blank line is a caption for the commands below.
      if (lastVerb) cmds[lastVerb].push(l);
      else pending.push(l);
    } else {
      pending = [];
      lastVerb = null;
    }
  }
  return { cmds, notes };
}

const { cmds: harvested, notes: harvestedNote } = harvestFences(cliMd);

// ── 2c. corpus-wide fallback ─────────────────────────────────────────────
// Some verbs (ci, fleet, orient, blueprint, …) are only shown running inside
// their own deep-dive doc, never in the CLI reference. Scanning the whole
// docs/ tree means a verb's page shows real commands wherever they live.
const corpusHarvest = {}; // filename → { cmds, notes }
for (const name of readdirSync(join(MADDU, 'docs'))) {
  if (!name.endsWith('.md') || name === '03-cli-reference.md') continue;
  corpusHarvest[name] = harvestFences(readFileSync(join(MADDU, 'docs', name), 'utf8'));
}

/** Best corpus source for a verb: its own deep-dive doc, else the doc that shows it most. */
function corpusFallback(verb, docFile) {
  const ranked = Object.entries(corpusHarvest)
    .filter(([, h]) => h.cmds[verb]?.length)
    .sort(([a, ha], [b, hb]) => {
      if (a === docFile) return -1;
      if (b === docFile) return 1;
      return hb.cmds[verb].length - ha.cmds[verb].length;
    });
  if (!ranked.length) return null;
  const [file, h] = ranked[0];
  return { file, lines: h.cmds[verb], note: h.notes[verb] ?? null };
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
// The mirrored corpus (scripts/gen-docs.mjs) hosts most deep-dive docs on the
// site itself; anything it doesn't mirror still resolves on GitHub.
const mirrorBySourceFile = new Map();
const manifestPath = join(siteRoot, 'src', 'data', 'docs-manifest.json');
if (existsSync(manifestPath)) {
  const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const g of m.groups) for (const item of g.items) mirrorBySourceFile.set(item.sourceFile, item.url);
  // capability-docs.json can point at a pointer stub (`doctor` → 06-hard-rules.md,
  // which is just "See hard-rules.md"). The mirror folded those into their
  // canonical page — follow the same aliases so the link lands on real content.
  for (const [from, to] of Object.entries(m.aliases ?? {})) {
    const seen = new Set();
    let target = to;
    while (m.aliases?.[target] && !seen.has(target)) { seen.add(target); target = m.aliases[target]; }
    if (mirrorBySourceFile.has(target)) mirrorBySourceFile.set(from, mirrorBySourceFile.get(target));
  }
} else {
  warnings.push('docs-manifest.json missing — deep-dive links fall back to GitHub (run `npm run docs`)');
}

const verbs = verbKeys.map((verb) => {
  const ch = charterByVerb[verb] || null;
  if (!ch) warnings.push(`charter has no domain row for "${verb}"`);
  const cli = cliByVerb[verb] || null;
  const docFile = capDocs.verbs[verb];
  const deepDive = docFile
    ? {
        file: docFile,
        url: mirrorBySourceFile.get(docFile) ?? `${DOCS_BASE_URL}/${capDocs.docsDir}/${docFile}`,
        onSite: mirrorBySourceFile.has(docFile),
        sourceUrl: `${DOCS_BASE_URL}/${capDocs.docsDir}/${docFile}`,
      }
    : null;

  // Three sources, most specific first: the verb's own `## maddu <verb>`
  // section, then the release-grouped fences in the CLI reference, then the
  // rest of the corpus (usually the verb's own deep-dive doc).
  let blocks = cli?.blocks ?? [];
  let cliSource = blocks.length ? 'cli-reference' : null;
  let fallbackNote = null;
  if (!blocks.length && harvested[verb]?.length) {
    blocks = [harvested[verb].join('\n')];
    cliSource = 'cli-reference-grouped';
    fallbackNote = harvestedNote[verb] ?? null;
  }
  if (!blocks.length) {
    const fb = corpusFallback(verb, docFile);
    if (fb) {
      blocks = [fb.lines.join('\n')];
      cliSource = `docs/${fb.file}`;
      fallbackNote = fb.note;
    }
  }
  if (!blocks.length) warnings.push(`no CLI surface found anywhere for "${verb}"`);

  const rawSummary = firstSentence(cli?.intro) || (ch ? ch.tagline : null) || fallbackNote || null;
  const summary = rawSummary ? rawSummary.charAt(0).toUpperCase() + rawSummary.slice(1) : null;
  return {
    verb,
    domain: ch?.domain ?? null,
    domainId: ch?.domainId ?? null,
    domainPurpose: ch?.domainPurpose ?? null,
    summary,
    since: cli?.since ?? null,
    cliIntro: cli?.intro ?? null,
    cliBlocks: blocks,
    /** Which corpus file the commands came from — the page attributes it when
     *  it isn't the CLI reference's own section for this verb. */
    cliSource,
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
