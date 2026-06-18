// gen-og.mjs — generate per-page OG cards. Each page gets its own
// 1200×630 PNG with a tone-coded eyebrow, title (up to 3 lines), and the
// shared brand strip. Plex fonts are embedded as base64 woff2 so sharp's
// librsvg backend renders pixel-perfect Plex.
//
// Wired into `npm run build` as a prebuild step. Also runnable standalone:
//
//   node scripts/gen-og.mjs
//
// Output: public/og/<slug>.png (+ matching .svg source kept for tweaks).

// resvg-js handles SVG → PNG with proper font support: pass the woff2
// files as Buffers via the `font.fontBuffers` option and they're loaded
// into a fontdb that the SVG renderer can reach. Sharp / librsvg can't.
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const fontDir = resolve(root, 'public/fonts');
const outDir = resolve(root, 'public/og');
mkdirSync(outDir, { recursive: true });

// ── Tone palette — mirrors the brand tokens ─────────────────────────
const TONE = {
  accent:    { stroke: '#D0FF00', fill: '#D0FF00', eyebrow: '#D0FF00' },
  'accent-2':{ stroke: '#56B8FF', fill: '#56B8FF', eyebrow: '#56B8FF' },
  warn:      { stroke: '#F2BD5C', fill: '#F2BD5C', eyebrow: '#F2BD5C' },
  danger:    { stroke: '#FF5E7A', fill: '#FF5E7A', eyebrow: '#FF5E7A' },
  brand:     { stroke: '#F04E23', fill: '#F04E23', eyebrow: '#F04E23' },
  ok:        { stroke: '#61D394', fill: '#61D394', eyebrow: '#61D394' },
};

// Font buffers — handed to resvg's fontdb so SVG text elements with
// font-family="IBM Plex Sans Condensed" / "IBM Plex Mono" resolve cleanly.
function loadFont(name) {
  const path = resolve(fontDir, name);
  if (!existsSync(path)) {
    throw new Error(`font missing: ${path}. Run \`bash scripts/fetch-fonts.sh\` first.`);
  }
  return readFileSync(path);
}

const FONT_BUFFERS = [
  loadFont('plex-cond-400.woff2'),
  loadFont('plex-cond-500.woff2'),
  loadFont('plex-cond-600.woff2'),
  loadFont('plex-cond-700.woff2'),
  loadFont('plex-mono-400.woff2'),
  loadFont('plex-mono-500.woff2'),
  loadFont('plex-mono-600.woff2'),
  loadFont('plex-sans-400.woff2'),
  loadFont('plex-sans-500.woff2'),
  loadFont('plex-sans-600.woff2'),
];

// ── Card template ───────────────────────────────────────────────────
function card({ slug, eyebrow, title, tone = 'accent', stats }) {
  const t = TONE[tone] || TONE.accent;
  const lines = Array.isArray(title) ? title : [title];

  // Layout math — keep the eyebrow + title block centered in the
  // vertical "hero zone" between the top hairline (y=125) and the
  // bottom strip (y=510). Title lines anchored to baseline at y=80
  // intervals; whole block translates so it sits under the eyebrow.
  const EYEBROW_Y = 200;
  const TITLE_START = EYEBROW_Y + 60;   // 60px below eyebrow baseline
  const LINE_H = 78;

  const statBlocks = (stats || []).map((s, i) => {
    const x = i * 200;
    return `
      <g transform="translate(${x}, 0)">
        <text x="0" y="0" fill="#6a7079" font-size="11" font-family="IBM Plex Mono" font-weight="400" letter-spacing="2">${s.label}</text>
        <text x="0" y="36" fill="${t.fill}" font-size="32" font-weight="700" font-family="IBM Plex Sans Condensed">${s.value}</text>
      </g>
    `;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="bg-accent2" cx="80%" cy="20%" r="55%">
      <stop offset="0%" stop-color="#56B8FF" stop-opacity="0.14" />
      <stop offset="100%" stop-color="#56B8FF" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="bg-tone" cx="20%" cy="90%" r="55%">
      <stop offset="0%" stop-color="${t.fill}" stop-opacity="0.12" />
      <stop offset="100%" stop-color="${t.fill}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="bg-brand" cx="50%" cy="100%" r="60%">
      <stop offset="0%" stop-color="#F04E23" stop-opacity="0.06" />
      <stop offset="100%" stop-color="#F04E23" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="hairline" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#507195" stop-opacity="0" />
      <stop offset="50%" stop-color="#507195" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#507195" stop-opacity="0" />
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="#050B17" />
  <rect width="1200" height="630" fill="url(#bg-accent2)" />
  <rect width="1200" height="630" fill="url(#bg-tone)" />
  <rect width="1200" height="630" fill="url(#bg-brand)" />

  <!-- Brand strip -->
  <g transform="translate(72, 64)">
    <circle cx="14" cy="14" r="18" fill="#F04E23" fill-opacity="0.18" />
    <path d="M14 0 L28 14 L14 28 L0 14 Z" fill="#F04E23" />
    <text x="44" y="22" fill="#E8E6E3" font-size="22" font-weight="700" font-family="IBM Plex Sans Condensed" letter-spacing="2">MÁDDU</text>
    <line x1="135" y1="14" x2="155" y2="14" stroke="#507195" stroke-opacity="0.5" stroke-width="1" />
    <text x="166" y="20" fill="#6a7079" font-size="13" font-family="IBM Plex Mono" letter-spacing="2">SOURCE OF LOCAL TRUTH</text>
  </g>

  <!-- Top hairline -->
  <rect x="72" y="124" width="1056" height="1" fill="url(#hairline)" />

  <!-- Eyebrow -->
  <text x="72" y="${EYEBROW_Y}" fill="${t.eyebrow}" font-size="14" font-family="IBM Plex Mono" font-weight="500" letter-spacing="3">${eyebrow}</text>

  <!-- Title (1–3 lines) -->
  ${lines.map((line, i) => `
    <text x="72" y="${TITLE_START + i * LINE_H}" fill="#E8E6E3" font-size="64" font-weight="700" font-family="IBM Plex Sans Condensed" letter-spacing="-1">${line}</text>
  `).join('')}

  <!-- Bottom hairline -->
  <rect x="72" y="510" width="1056" height="1" fill="url(#hairline)" />

  <!-- Bottom strip: stats + URL -->
  <g transform="translate(72, 548)">
    ${statBlocks}
    <g transform="translate(880, 12)">
      <rect x="0" y="0" width="176" height="36" rx="4" fill="${t.fill}" fill-opacity="0.10" stroke="${t.stroke}" stroke-opacity="0.4" stroke-width="1" />
      <text x="88" y="24" fill="${t.eyebrow}" font-size="13" font-family="IBM Plex Mono" font-weight="500" text-anchor="middle" letter-spacing="2">maddu.dev${slug === 'index' ? '' : '/' + slug}</text>
    </g>
  </g>
</svg>
`;
}

// ── Page configs ────────────────────────────────────────────────────
const PAGES = [
  {
    slug: 'index',
    eyebrow: 'V1.18 · LOCAL-FIRST · RUNTIME-AGNOSTIC',
    title: ['The orchestration spine', 'that outlives every', 'agent that touches it.'],
    tone: 'accent',
    stats: [
      { label: 'HARD RULES',       value: '8 + 1' },
      { label: 'DOCTOR GATES',     value: '60' },
      { label: 'STRESS SCENARIOS', value: '15' },
      { label: 'AUTO-REPAIR',      value: '0' },
    ],
  },
  {
    slug: 'how-it-works',
    eyebrow: 'HOW IT WORKS · SUBSTRATE → PIPELINE',
    title: ['Walk the canonical flow', 'one stage at a time.'],
    tone: 'accent',
    stats: [
      { label: 'TRANSITIONS',  value: '6' },
      { label: 'PIPELINES',    value: '3' },
      { label: 'STAGES',       value: '8' },
      { label: 'EVENTS / SLICE', value: '12+' },
    ],
  },
  {
    slug: 'architecture',
    eyebrow: 'ARCHITECTURE · COLOR-CODED ONTOLOGY',
    title: ['Fourteen layers.', 'One charter.'],
    tone: 'accent-2',
    stats: [
      { label: 'LAYERS',        value: '14' },
      { label: 'INVARIANTS',    value: '8 + 1' },
      { label: 'VERBS',         value: '62' },
      { label: 'COCKPIT ROUTES', value: '38+' },
    ],
  },
  {
    slug: 'security',
    eyebrow: 'SECURITY · STRUCTURAL, NOT ADVISORY',
    title: ['Security is structural.', 'Not advisory.'],
    tone: 'danger',
    stats: [
      { label: 'DEFENSES',     value: '7' },
      { label: 'SECRET SCAN',  value: '6 PATTERNS' },
      { label: 'PINNED DEPS',  value: 'SHA256' },
      { label: 'HOSTED RELAY', value: '0' },
    ],
  },
  {
    slug: 'threat-model',
    eyebrow: 'THREAT MODEL · ATTACKS + RESIDUAL RISK',
    title: ['Threats named.', 'Defenses named.', 'Residual risk named.'],
    tone: 'danger',
    stats: [
      { label: 'STRUCTURAL DEFENSES', value: '7' },
      { label: 'RULES ENFORCED',      value: '5 · 6 · 9' },
      { label: 'EVENT TYPES',         value: '~45' },
      { label: 'AUTO-REPAIR',         value: '0' },
    ],
  },
  {
    slug: 'governance',
    eyebrow: 'GOVERNANCE · DISCIPLINE PER WORKSPACE',
    title: ['The gauntlet,', 'and three tiers', 'that fit it.'],
    tone: 'warn',
    stats: [
      { label: 'TIERS',         value: '3' },
      { label: 'GAUNTLET GATES', value: '4' },
      { label: 'APPROVAL EVENTS', value: '3' },
      { label: 'INVARIANTS',    value: 'UNCHANGED' },
    ],
  },
  {
    slug: 'hard-rules',
    eyebrow: 'HARD RULES · THE 8+1 INVARIANTS',
    title: ['The 8+1', 'hard rules.'],
    tone: 'brand',
    stats: [
      { label: 'HARD RULES',    value: '8 + 1' },
      { label: 'DOCTOR GATES',  value: '60' },
      { label: 'PERMANENT SINCE', value: 'v0.19.0' },
      { label: 'AUTO-REPAIR',   value: '0' },
    ],
  },
  {
    slug: 'capabilities',
    eyebrow: 'CAPABILITIES · THE VERB ONTOLOGY',
    title: ['Every verb', 'earns its place.', 'Or it goes.'],
    tone: 'accent',
    stats: [
      { label: 'VERBS',         value: '62' },
      { label: 'PURPOSE AREAS', value: '8' },
      { label: 'INVARIANTS',    value: '9' },
      { label: 'SLASH ON-RAMPS', value: '23' },
    ],
  },
  {
    slug: 'install',
    eyebrow: 'INSTALL · REPO PRIVATE · COMING SOON',
    title: ['Install when ready.', 'Read while you wait.'],
    tone: 'warn',
    stats: [
      { label: 'PAGES TO READ', value: '8' },
      { label: 'PIPELINES',     value: '3' },
      { label: 'DOCTOR GATES',  value: '60' },
      { label: 'INSTALL TIME',  value: '~5 MIN' },
    ],
  },
  {
    slug: 'changelog',
    eyebrow: 'CHANGELOG · V0.17.1 → V1.18.0',
    title: ['Thirty-six releases.', 'One charter held.'],
    tone: 'accent-2',
    stats: [
      { label: 'RELEASES',         value: '36' },
      { label: 'DOCTOR GATES +',   value: '+42' },
      { label: 'STRESS SCENARIOS +', value: '+15' },
      { label: 'INVARIANTS BROKEN', value: '0' },
    ],
  },
  {
    slug: 'manifesto',
    eyebrow: 'MANIFESTO · WHY THIS EXISTS · IN PROSE',
    title: ['Capability gets the', 'headlines. Accountability', 'is the gap.'],
    tone: 'brand',
    stats: [
      { label: 'SECTIONS',         value: '7' },
      { label: 'READ TIME',        value: '~6 MIN' },
      { label: 'POSITION TAKEN',   value: 'YES' },
      { label: 'HEDGING WORDS',    value: '0' },
    ],
  },
  {
    slug: 'brand',
    eyebrow: 'BRAND · ASSETS · TOKENS · USAGE',
    title: ['The brand, named', 'and downloadable.'],
    tone: 'brand',
    stats: [
      { label: 'COLOR TOKENS',    value: '14' },
      { label: 'TYPE FAMILIES',   value: '3' },
      { label: 'PLEX WEIGHTS',    value: '10' },
      { label: 'RULE',            value: '#7' },
    ],
  },
  {
    slug: '404',
    eyebrow: 'ROUTE_NOT_FOUND · SPINE STILL INTACT',
    title: ['That route', 'doesn’t exist.', 'The spine is fine.'],
    tone: 'danger',
    stats: [
      { label: 'STATUS',       value: '404' },
      { label: 'SPINE',        value: 'OK' },
      { label: 'AUDIT TRAIL',  value: 'INTACT' },
      { label: 'PANIC',        value: 'NO' },
    ],
  },
];

// Per-release OG cards. Subdir public/og/changelog/<slug>.png, picked up
// by Layout when pathname matches /changelog/v1-3-0 deep links.
const RELEASES = [
  { v: 'v1.18.0', slug: 'v1-18-0', date: '2026-06-18', type: 'feature',   tone: 'accent',   headline: 'Architecture drift · maddu architecture' },
  { v: 'v1.17.0', slug: 'v1-17-0', date: '2026-06-18', type: 'hardening', tone: 'danger',   headline: 'Robustness bundle · debt + risk + drift gate' },
  { v: 'v1.16.0', slug: 'v1-16-0', date: '2026-06-18', type: 'feature',   tone: 'accent',   headline: 'Test command split · self-test + project tests' },
  { v: 'v1.15.0', slug: 'v1-15-0', date: '2026-06-11', type: 'feature',   tone: 'accent',   headline: 'Blueprint robustness · --distill + README' },
  { v: 'v1.14.0', slug: 'v1-14-0', date: '2026-06-09', type: 'hardening', tone: 'danger',   headline: 'Spine tamper-evidence · prev_hash chain' },
  { v: 'v1.13.0', slug: 'v1-13-0', date: '2026-06-09', type: 'hardening', tone: 'danger',   headline: 'Robustness hardening · tighten the guarantees' },
  { v: 'v1.12.0', slug: 'v1-12-0', date: '2026-06-09', type: 'feature',   tone: 'accent',   headline: 'Project blueprint · maddu blueprint' },
  { v: 'v1.11.0', slug: 'v1-11-0', date: '2026-06-09', type: 'hardening', tone: 'danger',   headline: 'Drift-proofing · single-source config seeding' },
  { v: 'v1.10.0', slug: 'v1-10-0', date: '2026-06-09', type: 'feature',   tone: 'accent',   headline: 'Invocation-logic pass 2 · light up dead domains' },
  { v: 'v1.9.2', slug: 'v1-9-2', date: '2026-06-09', type: 'patch',     tone: 'warn',     headline: 'Name maddu learn in the worker brief' },
  { v: 'v1.9.1', slug: 'v1-9-1', date: '2026-06-09', type: 'patch',     tone: 'warn',     headline: 'maddu learn · Windows spawn fix' },
  { v: 'v1.9.0', slug: 'v1-9-0', date: '2026-06-09', type: 'feature',   tone: 'accent',   headline: 'Failure learning · maddu learn' },
  { v: 'v1.8.0', slug: 'v1-8-0', date: '2026-06-05', type: 'hardening', tone: 'danger',   headline: 'Rule scope boundary · framework, not product' },
  { v: 'v1.7.0', slug: 'v1-7-0', date: '2026-06-04', type: 'feature',   tone: 'accent',   headline: 'Invocation logic · wire WHEN domains fire' },
  { v: 'v1.6.0', slug: 'v1-6-0', date: '2026-06-04', type: 'feature',   tone: 'accent',   headline: 'Orchestration handoff · orient + handoff' },
  { v: 'v1.5.0', slug: 'v1-5-0', date: '2026-06-03', type: 'feature',   tone: 'accent',   headline: 'Real sub-worker spawn + tracking' },
  { v: 'v1.4.0', slug: 'v1-4-0', date: '2026-06-03', type: 'feature',   tone: 'accent',   headline: 'Empirical insights + plugin loader' },
  { v: 'v1.3.0', slug: 'v1-3-0', date: '2026-05-24', type: 'feature',   tone: 'accent',   headline: 'Coherence realignment + completeness' },
  { v: 'v1.2.3', slug: 'v1-2-3', date: '2026-05-24', type: 'polish',    tone: 'accent-2', headline: 'Entity drawer' },
  { v: 'v1.2.2', slug: 'v1-2-2', date: '2026-05-24', type: 'polish',    tone: 'accent-2', headline: 'Cockpit path polish' },
  { v: 'v1.2.1', slug: 'v1-2-1', date: '2026-05-24', type: 'polish',    tone: 'accent-2', headline: 'Multi-bridge polish' },
  { v: 'v1.2.0', slug: 'v1-2-0', date: '2026-05-24', type: 'hardening', tone: 'danger',   headline: 'Supply-chain hardening + Hermes' },
  { v: 'v1.1.2', slug: 'v1-1-2', date: '2026-05-23', type: 'patch',     tone: 'warn',     headline: 'Narrative refresh + P3 patches' },
  { v: 'v1.1.1', slug: 'v1-1-1', date: '2026-05-22', type: 'patch',     tone: 'warn',     headline: 'Burn-in patch · 12 fixes' },
  { v: 'v1.1.0', slug: 'v1-1-0', date: '2026-05-22', type: 'feature',   tone: 'accent',   headline: 'Autonomy + planning + tool gateway' },
  { v: 'v1.0.5', slug: 'v1-0-5', date: '2026-05-22', type: 'patch',     tone: 'warn',     headline: 'Docs sweep · Phase-X cleared' },
  { v: 'v1.0.4', slug: 'v1-0-4', date: '2026-05-22', type: 'patch',     tone: 'warn',     headline: 'Generic default lane catalog' },
  { v: 'v1.0.3', slug: 'v1-0-3', date: '2026-05-22', type: 'patch',     tone: 'warn',     headline: 'Framework-only routes' },
  { v: 'v1.0.2', slug: 'v1-0-2', date: '2026-05-22', type: 'patch',     tone: 'warn',     headline: 'Stage-scroll hotfix' },
  { v: 'v1.0.1', slug: 'v1-0-1', date: '2026-05-22', type: 'patch',     tone: 'warn',     headline: 'Cockpit UX patch' },
  { v: 'v1.0.0', slug: 'v1-0-0', date: '2026-05-22', type: 'milestone', tone: 'brand',    headline: 'Stable declaration' },
  { v: 'v0.19.2', slug: 'v0-19-2', date: '2026-05-21', type: 'polish',  tone: 'accent-2', headline: 'UX polish · 6 cockpit routes' },
  { v: 'v0.19.1', slug: 'v0-19-1', date: '2026-05-21', type: 'patch',   tone: 'warn',     headline: 'Burn-in patch · 11 fixes' },
  { v: 'v0.19.0', slug: 'v0-19-0', date: '2026-05-21', type: 'feature', tone: 'accent',   headline: 'Completeness + hardening · Rule #9 permanent' },
  { v: 'v0.18.0', slug: 'v0-18-0', date: '2026-05-21', type: 'feature', tone: 'accent',   headline: 'OMC-inspired UX shell' },
  { v: 'v0.17.1', slug: 'v0-17-1', date: '2026-05-20', type: 'milestone', tone: 'brand',  headline: 'Arc starting point · baseline' },
];

const TYPE_STAT = {
  milestone: 'MILESTONE',
  feature:   'FEATURE',
  hardening: 'HARDENING',
  polish:    'POLISH',
  patch:     'PATCH',
};

// Wrap a long headline onto two lines if it has a natural " + " or " · " pivot.
function wrapHeadline(s) {
  if (s.length <= 26) return [s];
  // Prefer " + " split, then " · ", then last space.
  for (const sep of [' + ', ' · ']) {
    const i = s.indexOf(sep);
    if (i > 0 && i < s.length - 2) return [s.slice(0, i + sep.length - 1), s.slice(i + sep.length - 1)];
  }
  const mid = Math.floor(s.length / 2);
  const sp = s.lastIndexOf(' ', mid);
  if (sp > 0) return [s.slice(0, sp), s.slice(sp + 1)];
  return [s];
}

const releaseCards = RELEASES.map((r) => ({
  slug: 'changelog/' + r.slug,
  eyebrow: 'CHANGELOG · ' + r.v.toUpperCase() + ' · ' + r.date,
  title: [r.v, ...wrapHeadline(r.headline)],
  tone: r.tone,
  stats: [
    { label: 'TYPE',          value: TYPE_STAT[r.type] || 'RELEASE' },
    { label: 'DATE',          value: r.date.replace(/-/g, '·') },
    { label: 'INVARIANT',     value: 'HELD' },
    { label: 'DOCTOR',        value: 'GREEN' },
  ],
}));

PAGES.push(...releaseCards);

// Per-manifesto-section cards. Same template, slug = manifesto/<roman>.
// Stubs at src/pages/manifesto/[slug].astro mirror the release pattern.
const SECTIONS = [
  { slug: 'i',    n: 'I',   title: 'Capability gets the headlines.',                 sub: 'Accountability is the gap.' },
  { slug: 'ii',   n: 'II',  title: 'Construction-lawsuit',                            sub: 'chain of custody.' },
  { slug: 'iii',  n: 'III', title: 'Local-first isn’t nostalgia.',               sub: 'It’s a security posture.' },
  { slug: 'iv',   n: 'IV',  title: 'Confidence costs',                                sub: 'a checkpoint.' },
  { slug: 'v',    n: 'V',   title: 'Runtime-agnostic,',                               sub: 'by design and by survival.' },
  { slug: 'vi',   n: 'VI',  title: 'Discipline that scales',                          sub: 'with consequence.' },
  { slug: 'vii',  n: 'VII', title: 'Invariants you can’t change become',          sub: 'invariants you don’t argue about.' },
];

const sectionCards = SECTIONS.map((s) => ({
  slug: 'manifesto/' + s.slug,
  eyebrow: 'MANIFESTO · § ' + s.n,
  title: [s.title, s.sub],
  tone: 'brand',
  stats: [
    { label: 'SECTION',  value: s.n },
    { label: 'OF',       value: '7' },
    { label: 'POSITION', value: 'TAKEN' },
    { label: 'HEDGING',  value: '0' },
  ],
}));
PAGES.push(...sectionCards);

// ── Generate ────────────────────────────────────────────────────────
console.log(`Generating ${PAGES.length} OG cards into ${outDir}/`);
mkdirSync(resolve(outDir, 'changelog'), { recursive: true });
mkdirSync(resolve(outDir, 'manifesto'), { recursive: true });
for (const p of PAGES) {
  const svg = card(p);
  const svgPath = resolve(outDir, p.slug + '.svg');
  const pngPath = resolve(outDir, p.slug + '.png');
  writeFileSync(svgPath, svg);

  const resvg = new Resvg(svg, {
    background: '#050B17',
    font: {
      fontBuffers: FONT_BUFFERS,
      defaultFontFamily: 'IBM Plex Sans Condensed',
      loadSystemFonts: false,
    },
    fitTo: { mode: 'width', value: 1200 },
  });
  const png = resvg.render().asPng();
  writeFileSync(pngPath, png);
  console.log(`  ✓ ${p.slug}.png`);
}
console.log(`Done. ${PAGES.length} cards × (svg + png).`);
