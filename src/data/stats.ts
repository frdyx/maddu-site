// stats.ts — the single source for every framework number quoted anywhere on
// the site. Pages import from here; no page hand-types a count. Derived values
// (verb totals, release count) come from the generated data files, so a
// `node scripts/gen-capabilities.mjs` + a releases.ts entry is the whole
// re-sync ritual. Hand-maintained values carry the release they were read at.

import capabilities from './capabilities-detail.json';
import facts from './framework-facts.json';
import docsManifest from './docs-manifest.json';
import { RELEASES } from './releases';

/** Version + event contract — read from the framework's own generated
 *  artifacts (version.json, docs/event-schema.md) by scripts/gen-docs.mjs.
 *  These can no longer drift: `npm run docs` re-reads them. */
export const VERSION: string = facts.version;
export const VERSION_SHORT = 'v' + facts.version.split('.').slice(0, 2).join('.');
export const RELEASED: string = facts.released;

/** Capability surface — derived from capabilities-detail.json (regenerated from the framework repo). */
export const VERBS_TOTAL: number = capabilities.total;
export const VERBS_WITH_DEEP_DIVE: number = capabilities.withDeepDive;
export const VERBS_WITH_CLI: number = capabilities.withCli;
export const PURPOSE_AREAS = 8;
export const VERBS_CORE = VERBS_TOTAL - 4; // orchestration layer is exactly 4 verbs
export const VERBS_ORCHESTRATION = 4; // coordinator · loop · pipeline · team

/** Docs corpus — derived from the mirror in src/content/docs. */
export const DOCS_MIRRORED: number = docsManifest.total;

export const EVENT_TYPES: number = facts.eventTypes;
export const CONTRACT_VERSION: string = facts.contractVersion;

/** Enforcement surface — hand-read from the framework repo at v1.118.0.
 *  These are NOT derivable: the corpus states them only in prose, and where a
 *  doc does carry a count it lags reality (22-slash-commands.md lists 34 of
 *  the 40 commands actually installed). A dated hand value beats a wrong
 *  derived one — re-read these when the numbers matter. */
export const HARD_RULES = '8 + 1';
export const DOCTOR_GATES = 75;    // v1.115.0 added memory-injection-bounded; v1.116.0 "cap stays 75"
export const AUDIT_CHECKS = 16;    // maddu audit self-checks — 16/16 in CHANGELOG
export const STRESS_SCENARIOS = 17; // counted from scripts/test/stress-harness.mjs SCENARIOS

/** Surfaces. */
export const SLASH_COMMANDS = 40;  // counted from .claude/commands/maddu-*.md
/** NOT re-verified at v1.118.0 — carries an older hand read. The cockpit
 *  registers routes dynamically, so there is nothing static to count; confirm
 *  against a running cockpit before quoting this anywhere new. */
export const COCKPIT_ROUTES = 50;
export const ARCHITECTURE_LAYERS = 14; // the site's ontology layering

/** Releases — derived from releases.ts. */
export const RELEASE_COUNT: number = RELEASES.length;
