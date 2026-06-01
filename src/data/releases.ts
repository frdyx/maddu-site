// releases.ts — single source for the changelog release list. Mirrored
// from src/pages/changelog.astro / atom.xml.ts so feeds, the API, and
// the page never drift. When a new release ships, update this file
// and the change propagates to /changelog, /atom.xml, /feed.json, and
// /api/changelog.json in one stroke.

export type ReleaseType = 'milestone' | 'feature' | 'hardening' | 'polish' | 'patch';

export interface Release {
  v: string;
  id: string;
  date: string;             // YYYY-MM-DD
  type: ReleaseType;
  headline: string;
  summary: string;
}

export const RELEASES: Release[] = [
  { v: 'v1.3.0',  id: 'v1-3-0',  date: '2026-05-28', type: 'feature',   headline: 'Coherence realignment + completeness', summary: 'Three default pipelines, maddu audit charter-drift command, forgiving CLI verbs, slash on-ramp triage, charter published. Closed the feature-sprawl diagnosis.' },
  { v: 'v1.2.3',  id: 'v1-2-3',  date: '2026-05-24', type: 'polish',    headline: 'Entity drawer', summary: 'Clickable plans and kanban cards open a right-side detail drawer. Reusable openEntityDrawer primitive for future routes.' },
  { v: 'v1.2.2',  id: 'v1-2-2',  date: '2026-05-24', type: 'polish',    headline: 'Cockpit path polish', summary: 'Compact drive/.../basename path display, click-to-copy with toast, scope-pill active-class fix.' },
  { v: 'v1.2.1',  id: 'v1-2-1',  date: '2026-05-24', type: 'polish',    headline: 'Multi-bridge polish', summary: 'Port-collision refusal, bridges list / kill-all, CWD-vs-workspace triage at start time.' },
  { v: 'v1.2.0',  id: 'v1-2-0',  date: '2026-05-24', type: 'hardening', headline: 'Supply-chain hardening + Hermes adapter', summary: 'maddu trust audit/pin/verify, MCP SHA256 provenance, worker env allowlist default-deny, secret-scan on tool argv, threat-model doc, Trust cockpit route.' },
  { v: 'v1.1.2',  id: 'v1-1-2',  date: '2026-05-23', type: 'patch',     headline: 'Narrative refresh + P3 patches', summary: 'README badge refresh, Python cross-stack detector, skill candidate threshold tuned.' },
  { v: 'v1.1.1',  id: 'v1-1-1',  date: '2026-05-22', type: 'patch',     headline: 'Burn-in patch · 12 fixes', summary: 'Windows spawn EINVAL fix, ralph verify exit-code, plan --plan argv collision, kanban phases aggregation, maddu stop + SIGINT, install validation.' },
  { v: 'v1.1.0',  id: 'v1-1-0',  date: '2026-05-22', type: 'feature',   headline: 'Autonomy + planning + tool gateway', summary: 'Default tools, MCP template gallery, governance tiers, receipt log, kanban + plan persistence + auto-revision, loops, coordinator as Máddu primitive, skills starter pack.' },
  { v: 'v1.0.5',  id: 'v1-0-5',  date: '2026-05-22', type: 'patch',     headline: 'Docs sweep · Phase-X leakage cleared', summary: 'Deleted stale roadmap doc, cleaned Phase markers from four user docs.' },
  { v: 'v1.0.4',  id: 'v1-0-4',  date: '2026-05-22', type: 'patch',     headline: 'Generic default lane catalog', summary: 'Replaced internal lanes with 7 generic ones: architecture, frontend, backend, infra, tests, docs, general.' },
  { v: 'v1.0.3',  id: 'v1-0-3',  date: '2026-05-22', type: 'patch',     headline: 'Framework-only routes hidden on consumer installs', summary: 'frameworkOnly:true flag in ROUTES. Reusable affordance for framework-internal surfaces.' },
  { v: 'v1.0.2',  id: 'v1-0-2',  date: '2026-05-22', type: 'patch',     headline: 'Stage-scroll hotfix', summary: 'CSS grid + overflow fix: min-height: 0 on .stage + .stage-body. Composer no longer dragged below viewport.' },
  { v: 'v1.0.1',  id: 'v1-0-1',  date: '2026-05-22', type: 'patch',     headline: 'Cockpit UX patch', summary: 'Anchor composer, collapse sidenav, recent group with localStorage persistence.' },
  { v: 'v1.0.0',  id: 'v1-0-0',  date: '2026-05-22', type: 'milestone', headline: 'Stable declaration', summary: 'Public-surface stability commit. The 8+1 hard rules, the spine NDJSON format, the 13 slash command names, the cockpit routes, the CLI surface, the marker discipline are stable from here.' },
  { v: 'v0.19.2', id: 'v0-19-2', date: '2026-05-21', type: 'polish',    headline: 'UX polish · 6 cockpit routes', summary: 'Slash output re-print pattern, 6 dedicated cockpit routes: Cost, Advisors, Skill Injections, Model Routing, Test Status, Pipelines.' },
  { v: 'v0.19.1', id: 'v0-19-1', date: '2026-05-21', type: 'patch',     headline: 'Burn-in patch · 11 fixes', summary: 'Slash command marker regression, display-vs-summarize discipline, MADDU_SESSION_ID env honoring, slice-stop positional summary, /maddu-suggest (13th slash).' },
  { v: 'v0.19.0', id: 'v0-19-0', date: '2026-05-21', type: 'feature',   headline: 'Completeness + hardening · Rule #9 becomes permanent', summary: 'Token ledger emission via worker wrappers, advisor subprocess spawn, skill auto-injection, model routing hints, stress harness, upgrade matrix, 7 new doctor gates. Rule #9 graduates from candidate to permanent + enforced.' },
  { v: 'v0.18.0', id: 'v0-18-0', date: '2026-05-21', type: 'feature',   headline: 'OMC-inspired UX shell', summary: '12 slash commands as the operator on-ramp, intent routing wired in agent files, maddu suggest engine, multi-runtime agnostic surface.' },
  { v: 'v0.17.1', id: 'v0-17-1', date: '2026-05-20', type: 'milestone', headline: 'Arc starting point', summary: '18 doctor gates PASS, baseline before the v1.0 push. Every release after this had to keep doctor green and layout-refusal at 4/4.' },
];
