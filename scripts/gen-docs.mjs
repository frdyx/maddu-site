// gen-docs.mjs — ingest the framework's real docs corpus into the site.
//
// The site's /docs section is two tiers:
//   • curated  — hand-written marketing-grade pages (/docs, /docs/install, …)
//   • mirror   — every framework doc, generated, at /docs/reference/<slug>
//
// This script builds the mirror. It reads `$MADDU_REPO/docs/**/*.md`, writes
// normalised markdown + frontmatter into src/content/docs/ (an Astro content
// collection) and a sidebar/index manifest into src/data/docs-manifest.json.
// Both outputs are committed, so CI without the framework repo still builds —
// the same no-op contract scripts/gen-capabilities.mjs uses.
//
//   Usage:  node scripts/gen-docs.mjs   (set MADDU_REPO to override the path)

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, rmSync, copyFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, basename, extname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, '..');
const MADDU = process.env.MADDU_REPO ? resolve(process.env.MADDU_REPO) : resolve(siteRoot, '..', 'maddu');
const SRC_DOCS = join(MADDU, 'docs');

const OUT_CONTENT = join(siteRoot, 'src', 'content', 'docs');
const OUT_MANIFEST = join(siteRoot, 'src', 'data', 'docs-manifest.json');
const OUT_IMAGES = join(siteRoot, 'public', 'docs-images');

const GH_BASE = 'https://github.com/frdyx/maddu/blob/main/docs';
/** Route prefix for every mirrored page. Curated pages keep /docs/<name>. */
const ROUTE = '/docs/reference';

// ── policy ───────────────────────────────────────────────────────────────
// Contributor-facing process docs — deliberately not published (operator
// docs only). Change this list, re-run, commit: that is the whole knob.
const EXCLUDE = new Set([
  '17-validation-checklist.md', // release-process checklist for contributors
  '26-stress-testing.md',       // internal harness runbook
  'DESIGN-SYSTEM.md',           // cockpit design tokens — /brand covers this
  '00-index.md',                // corpus index — this mirror generates its own
]);
// NB: upgrade-policy.md is deliberately NOT excluded. It reads like a
// maintainer doc but is the operator answer to "what does `maddu upgrade`
// touch, and what will it never touch" — and 14-upgrading.md points at it.

// Subdirectories to ingest alongside the root docs. Flip a value to false to
// drop that family from the public site.
const SUBDIRS = {
  skills: true,
  audit: true,
  // Off by operator decision (2026-08-07): research/ is competitor deep-research
  // (AionUi, Hermes, TencentDB), unshipped roadmaps and ULTRAPLANs, and design
  // notes marked untracked-local. Not for the public site.
  research: false,
  sessions: true,
  releases: true,
};

// Ordered sidebar groups. A file listed here lands in that group, in that
// order; anything unlisted falls through to "More reference" with a warning,
// so a new framework doc surfaces on the site instead of disappearing.
const GROUPS = [
  ['Getting started', ['01-getting-started.md', 'installation.md', '18-first-slice.md', '21-agent-onboarding.md', 'upgrade-policy.md', '13-troubleshooting.md']],
  ['Concepts', ['charter.md', '02-concepts.md', '45-category.md', '15-architecture.md', '07-lanes-and-sessions.md', 'lanes.md', '08-slice-stop-ritual.md', '54-spine-anchor.md', 'event-schema.md']],
  ['CLI & surfaces', ['03-cli-reference.md', '22-slash-commands.md', '23-natural-language-routing.md', '28-default-tools.md', '04-cockpit-tour.md', '16-widget-kit.md', '05-bridge-endpoints.md', '53-operator-plane.md']],
  ['Governance & trust', ['hard-rules.md', '20-governance.md', '30-governance-tiers.md', '09-approvals-and-permissions.md', '39-rule-gate-traceability.md', '36-trust-audit.md', '34-threat-model.md', '47-earned-autonomy.md', '51-slm-governance.md', '52-oversight.md', '12-auth-and-imports.md']],
  ['Autonomy & orchestration', ['32-kanban-and-plans.md', '33-loops-and-coordinator.md', '43-focus-director.md', '49-team-sync.md', '19-multi-workspace.md', '42-agents-global-install.md']],
  ['Memory & learning', ['10-skills-and-hindsight.md', '24-skills-auto-inject.md', '37-failure-learning.md', '27-transcript-import.md', '50-experience-evolve.md', '25-model-routing.md']],
  ['Operations', ['46-ci.md', '44-session-hooks.md', '31-operations-log.md', '40-architecture-drift.md', '41-debt.md', '48-otel-export.md', '55-verify-replay.md', '38-blueprint.md', '11-runtimes-and-mcp.md', '29-mcp-templates.md', '35-hermes-adapter.md']],
  ['Recipes', []],        // skills/
  ['Working notes', []],  // audit/ + sessions/ + releases/
  ['Research', []],       // research/
];
const SUBDIR_GROUP = { skills: 'Recipes', audit: 'Working notes', sessions: 'Working notes', releases: 'Working notes', research: 'Research' };
const FALLBACK_GROUP = 'More reference';

if (!existsSync(SRC_DOCS)) {
  console.log(`[gen-docs] framework repo not found at ${MADDU} — keeping the committed mirror`);
  process.exit(0);
}

// ── helpers ──────────────────────────────────────────────────────────────
const warnings = [];

/** `40-architecture-drift.md` → `architecture-drift`; `lanes.md` → `lanes`. */
const slugOf = (file) => basename(file, '.md').replace(/^\d{2}-/, '').toLowerCase();

const flatten = (s) =>
  s.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
   .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
   .replace(/[*_`>#]/g, '')
   .replace(/\s+/g, ' ')
   .trim();

function firstParagraph(body) {
  const out = [];
  for (const line of body.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) { if (out.length) break; continue; }
    if (t.startsWith('#') || t.startsWith('```') || t.startsWith('<!--') || t.startsWith('|')) {
      if (out.length) break;
      continue;
    }
    out.push(t);
  }
  return flatten(out.join(' '));
}

function clamp(s, n) {
  if (!s || s.length <= n) return s;
  return s.slice(0, n).replace(/\s\S*$/, '') + '…';
}

/** YAML-safe double-quoted scalar. */
const yq = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';

// ── 1. collect source files ──────────────────────────────────────────────
const files = []; // { abs, rel, dir, name }
for (const name of readdirSync(SRC_DOCS)) {
  const abs = join(SRC_DOCS, name);
  if (!statSync(abs).isFile() || extname(name) !== '.md') continue;
  if (EXCLUDE.has(name)) continue;
  files.push({ abs, rel: name, dir: null, name });
}
for (const [dir, on] of Object.entries(SUBDIRS)) {
  const dirAbs = join(SRC_DOCS, dir);
  if (!on || !existsSync(dirAbs)) continue;
  for (const name of readdirSync(dirAbs)) {
    const abs = join(dirAbs, name);
    if (!statSync(abs).isFile()) continue;
    if (extname(name) !== '.md') continue; // PDFs and binaries are not mirrored
    if (name.startsWith('_')) continue;    // corpus convention: _foo.md = template/scaffold
    if (EXCLUDE.has(`${dir}/${name}`)) continue;
    files.push({ abs, rel: `${dir}/${name}`, dir, name });
  }
}

// ── 2. parse + detect pointer stubs ──────────────────────────────────────
// A stub like `06-hard-rules.md` ("# Hard rules\n\nSee [hard-rules.md](…).")
// is an alias, not a page: it becomes a link-rewrite target, never a route.
const parsed = [];
const aliases = {}; // source filename → canonical filename

for (const f of files) {
  const raw = readFileSync(f.abs, 'utf8');
  const lines = raw.split(/\r?\n/);
  const h1Idx = lines.findIndex((l) => /^#\s+\S/.test(l));
  // Source h1s carry the file's ordinal ("46 — CI rail (`maddu ci`)"). That
  // numbering is a filesystem artefact, not part of the title — drop it for
  // display; the source filename is shown on every page anyway.
  const rawTitle = h1Idx >= 0 ? flatten(lines[h1Idx].replace(/^#\s+/, '')) : slugOf(f.name);
  const title = rawTitle.replace(/^\d{1,2}\s*[—–-]\s*/, '');
  const body = (h1Idx >= 0 ? lines.slice(h1Idx + 1) : lines).join('\n').trim();

  const bodyText = body.replace(/<!--[\s\S]*?-->/g, '').trim();
  const stub = bodyText.length < 160 && /^See\s+\[[^\]]+\]\(([^)]+\.md)[^)]*\)\.?$/i.test(bodyText);
  if (stub) {
    const target = bodyText.match(/\(([^)#]+\.md)/)[1].replace(/^\.\//, '');
    aliases[f.rel] = target;
    continue;
  }
  parsed.push({ ...f, title, body, description: clamp(firstParagraph(body), 180) });
}

// ── 3. slug assignment (collision-safe) ──────────────────────────────────
const bySlug = new Map();
for (const p of parsed) {
  let slug = p.dir ? `${p.dir}/${slugOf(p.name)}` : slugOf(p.name);
  if (bySlug.has(slug)) {
    warnings.push(`slug collision "${slug}" — ${p.rel} kept as "${slug}-${slugOf(p.name).length}"`);
    slug = `${slug}-2`;
  }
  p.slug = slug;
  p.url = `${ROUTE}/${slug}`;
  bySlug.set(slug, p);
}
/**
 * Source filename → route, following pointer-stub aliases. `fromDir` is the
 * directory of the linking doc: a link inside `audit/` resolves against
 * `audit/` first (markdown links are sibling-relative), then against the
 * docs root.
 */
const routeFor = (file, fromDir = null) => {
  const raw = file.replace(/^\.\//, '');
  for (const candidate of fromDir ? [`${fromDir}/${raw}`, raw] : [raw]) {
    const seen = new Set();
    let f = candidate;
    while (aliases[f] && !seen.has(f)) { seen.add(f); f = aliases[f]; }
    const p = parsed.find((x) => x.rel === f);
    if (p) return p.url;
  }
  return null;
};

// ── 4. rewrite links + images ────────────────────────────────────────────
// Copy only the images the published docs actually embed. Mirroring the whole
// images/ directory would publish diagrams no page shows — including stale
// ones the site would then be serving under its own domain.
const usedImages = new Set();
for (const p of parsed) {
  for (const m of p.body.matchAll(/(?:\]\(|src=["']|href=["'])(?:\.\/)?images\/([^)"'\s]+)/g)) {
    usedImages.add(m[1]);
  }
}
rmSync(OUT_IMAGES, { recursive: true, force: true });
mkdirSync(OUT_IMAGES, { recursive: true });
const imagesDir = join(SRC_DOCS, 'images');
let copiedImages = 0;
if (existsSync(imagesDir)) {
  for (const name of usedImages) {
    const abs = join(imagesDir, name);
    if (existsSync(abs) && statSync(abs).isFile()) { copyFileSync(abs, join(OUT_IMAGES, name)); copiedImages++; }
    else warnings.push(`doc references images/${name} but the framework repo has no such file`);
  }
}

const unresolved = new Set();

// ── inline entity linking ────────────────────────────────────────────────
// Every `maddu <verb>` mentioned in prose becomes a link to that verb's page.
// The verb set is the audited roster from the framework's own capability map,
// so a renamed or retired verb stops linking instead of rotting.
const CAPDOCS = join(SRC_DOCS, 'capability-docs.json');
const capDocsVerbs = existsSync(CAPDOCS) ? JSON.parse(readFileSync(CAPDOCS, 'utf8')).verbs : {};
const VERBS = new Set(Object.keys(capDocsVerbs));
if (!VERBS.size) warnings.push('capability-docs.json missing — inline verb links skipped');
let linkCount = 0;

/**
 * Link the FIRST mention of each verb per page (linking all of them turns a
 * dense doc into a wall of blue). Fenced code is left completely alone, and an
 * already-linked span is never double-wrapped.
 */
function linkVerbs(md, selfVerb) {
  if (!VERBS.size) return md;
  const seen = new Set(selfVerb ? [selfVerb] : []);
  return md
    .split(/(```[\s\S]*?```)/g)
    .map((part, i) => {
      if (i % 2 === 1) return part; // inside a fence — never touch
      return part.replace(
        /(\[)?(`maddu ([a-z][a-z-]*)(?:[^`]*)?`)(\]\()?/g,
        (m, open, code, verb, close) => {
          if (open || close) return m;                    // already a link
          if (!VERBS.has(verb) || seen.has(verb)) return m;
          seen.add(verb);
          linkCount++;
          return `[${code}](/capabilities/${verb})`;
        },
      );
    })
    .join('');
}

function rewrite(md, self, fromDir) {
  const link = (m, file, hash) => {
    const url = routeFor(file, fromDir);
    if (url) return `](${url}${hash || ''})`;
    // Not mirrored (excluded doc, ../CHANGELOG.md, …) — keep it resolvable by
    // pointing at the file on GitHub rather than emitting a dead link.
    unresolved.add(`${self} → ${file}`);
    const ghPath = fromDir && !file.includes('/') ? `${fromDir}/${file}` : file;
    return `](${GH_BASE}/${ghPath.replace(/^\.\//, '')}${hash || ''})`;
  };
  return md
    // ](images/foo.svg) → ](/docs-images/foo.svg)
    .replace(/\]\((?:\.\/)?images\/([^)]+)\)/g, '](/docs-images/$1)')
    // The corpus embeds its diagrams as raw HTML (<a href="images/…"><img
    // src="images/…">), not markdown — without this they resolve against the
    // page route and 404.
    .replace(/\b(src|href)="(?:\.\/)?images\/([^"]+)"/g, '$1="/docs-images/$2"')
    .replace(/\bhref="(?:\.\/)?([A-Za-z0-9._-]+\.md)(#[^"]*)?"/g, (m, file, hash) => {
      const url = routeFor(file, fromDir);
      return url ? `href="${url}${hash || ''}"` : m;
    })
    // ](subdir/foo.md) → mirrored subdir route (checked first: more specific)
    .replace(/\]\((?:\.\/)?([a-z]+\/[A-Za-z0-9._-]+\.md)(#[^)]*)?\)/g, link)
    // ](40-architecture-drift.md#anchor) → ](/docs/reference/architecture-drift#anchor)
    .replace(/\]\((?:\.\/)?([A-Za-z0-9._-]+\.md)(#[^)]*)?\)/g, link);
}

// ── 5. emit the content collection ───────────────────────────────────────
rmSync(OUT_CONTENT, { recursive: true, force: true });
mkdirSync(OUT_CONTENT, { recursive: true });

const groupIndex = new Map();
GROUPS.forEach(([label], i) => groupIndex.set(label, i));

function groupFor(p) {
  if (p.dir) return SUBDIR_GROUP[p.dir] ?? FALLBACK_GROUP;
  for (const [label, list] of GROUPS) if (list.includes(p.name)) return label;
  warnings.push(`"${p.rel}" is not in any GROUPS bucket — filed under "${FALLBACK_GROUP}"`);
  return FALLBACK_GROUP;
}

function orderFor(p, group) {
  const entry = GROUPS.find(([label]) => label === group);
  const i = entry ? entry[1].indexOf(p.name) : -1;
  return i >= 0 ? i : 500; // unlisted → after the curated order, then alphabetical
}

for (const p of parsed) {
  p.group = groupFor(p);
  p.order = orderFor(p, p.group);
  const outFile = join(OUT_CONTENT, `${p.slug.replace(/\//g, '__')}.md`);
  // The verb this doc is the deep-dive FOR, if any — used both to suppress
  // self-linking in the prose and to emit the reference link in frontmatter.
  const selfVerb = Object.entries(capDocsVerbs).find(([, f]) => f === p.rel)?.[0] ?? null;
  const fm = [
    '---',
    `title: ${yq(p.title)}`,
    `slug: ${yq(p.slug)}`,
    `group: ${yq(p.group)}`,
    `order: ${p.order}`,
    `description: ${yq(p.description || `${p.title} — Máddu framework documentation.`)}`,
    `sourceFile: ${yq(p.rel)}`,
    `sourceUrl: ${yq(`${GH_BASE}/${p.rel}`)}`,
    // The verb this doc is the deep-dive FOR, if any. Its own prose never
    // self-links, so without this the page is a dead end back to the command
    // reference — the reverse link (verb page → here) already exists.
    ...(selfVerb ? [`verb: ${yq(selfVerb)}`] : []),
    '---',
    '',
  ].join('\n');
  writeFileSync(outFile, fm + linkVerbs(rewrite(p.body, p.rel, p.dir), selfVerb) + '\n', 'utf8');
}

// ── 6. manifest (sidebar + index page + link checking) ───────────────────
const ordered = [...parsed].sort((a, b) => {
  const ga = groupIndex.has(a.group) ? groupIndex.get(a.group) : 99;
  const gb = groupIndex.has(b.group) ? groupIndex.get(b.group) : 99;
  return ga - gb || a.order - b.order || a.title.localeCompare(b.title);
});

const groups = [];
for (const p of ordered) {
  let g = groups.find((x) => x.label === p.group);
  if (!g) groups.push((g = { label: p.group, items: [] }));
  g.items.push({ slug: p.slug, url: p.url, title: p.title, description: p.description, sourceFile: p.rel, sourceUrl: `${GH_BASE}/${p.rel}` });
}

const manifest = {
  schemaVersion: 1,
  route: ROUTE,
  ghBase: GH_BASE,
  total: parsed.length,
  excluded: [...EXCLUDE].sort(),
  aliases,
  groups,
};
writeFileSync(OUT_MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

// ── 7. framework facts ───────────────────────────────────────────────────
// Numbers the framework generates for itself — version, event contract — read
// straight from its own generated artifacts so stats.ts stops hand-carrying
// them. Anything the corpus does NOT state authoritatively stays hand-set in
// stats.ts (see the note there); guessing from a prose table is worse than a
// dated hand value.
const facts = {};
const versionPath = join(MADDU, 'version.json');
if (existsSync(versionPath)) {
  const v = JSON.parse(readFileSync(versionPath, 'utf8'));
  facts.version = v.version;
  facts.released = v.released ?? null;
  facts.phase = v.phase ?? null;
}
const schemaPath = join(SRC_DOCS, 'event-schema.md');
if (existsSync(schemaPath)) {
  const head = readFileSync(schemaPath, 'utf8').slice(0, 2000);
  const contract = head.match(/\*\*Contract version:\*\*\s*`([\d.]+)`/);
  const types = head.match(/\*\*Event types:\*\*\s*(\d+)/);
  if (contract) facts.contractVersion = contract[1];
  if (types) facts.eventTypes = Number(types[1]);
}
if (Object.keys(facts).length) {
  writeFileSync(join(siteRoot, 'src', 'data', 'framework-facts.json'), JSON.stringify(facts, null, 2) + '\n', 'utf8');
  console.log(`[gen-docs] framework facts → v${facts.version} · contract ${facts.contractVersion} · ${facts.eventTypes} event types`);

  // The changelog is hand-curated prose (releases.ts + changelog.astro) and
  // deliberately stays that way — but the version banner is now generated, so
  // a lagging changelog would silently contradict it. Surface the gap.
  const releasesTs = join(siteRoot, 'src', 'data', 'releases.ts');
  if (existsSync(releasesTs)) {
    const newest = readFileSync(releasesTs, 'utf8').match(/id:\s*'v([\d-]+)'/);
    const listed = newest ? newest[1].replace(/-/g, '.') : null;
    if (listed && listed !== facts.version) {
      warnings.push(
        `changelog lags the framework: releases.ts newest is v${listed}, framework is v${facts.version}. ` +
        `Add the missing entries to src/data/releases.ts AND src/pages/changelog.astro.`,
      );
    }
  }
} else {
  warnings.push('no framework facts read (version.json / event-schema.md missing)');
}

// ── report ───────────────────────────────────────────────────────────────
if (unresolved.size) warnings.push(`${unresolved.size} link(s) point outside the mirror — sent to GitHub: ${[...unresolved].slice(0, 5).join(', ')}${unresolved.size > 5 ? ', …' : ''}`);
if (Object.keys(aliases).length) console.log(`[gen-docs] ${Object.keys(aliases).length} pointer stub(s) folded into their canonical page: ${Object.keys(aliases).join(', ')}`);
if (warnings.length) console.warn('[gen-docs] notes:\n  - ' + warnings.join('\n  - '));
console.log(`[gen-docs] wrote ${parsed.length} pages in ${groups.length} groups → src/content/docs/ (+${copiedImages} images, ${linkCount} inline verb links)`);
