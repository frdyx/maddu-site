// stats.ts — the single source for every framework number quoted anywhere on
// the site. Pages import from here; no page hand-types a count. Derived values
// (verb totals, release count) come from the generated data files, so a
// `node scripts/gen-capabilities.mjs` + a releases.ts entry is the whole
// re-sync ritual. Hand-maintained values carry the release they were read at.

import capabilities from './capabilities-detail.json';
import { RELEASES } from './releases';

export const VERSION = '1.93.0';
export const VERSION_SHORT = 'v1.93';

/** Capability surface — derived from capabilities-detail.json (regenerated from the framework repo). */
export const VERBS_TOTAL: number = capabilities.total; // 69 at v1.93.0
export const VERBS_WITH_DEEP_DIVE: number = capabilities.withDeepDive; // 57 at v1.93.0
export const PURPOSE_AREAS = 8;
export const VERBS_CORE = VERBS_TOTAL - 4; // orchestration layer is exactly 4 verbs
export const VERBS_ORCHESTRATION = 4; // coordinator · loop · pipeline · team

/** Enforcement surface — read from the framework repo at v1.93.0. */
export const HARD_RULES = '8 + 1';
export const DOCTOR_GATES = 70; // builtin gate budget, 70/70 at cap (v1.93.0)
export const AUDIT_CHECKS = 16; // maddu audit self-checks
export const EVENT_TYPES = 162; // schematized + dispositioned event types
export const STRESS_SCENARIOS = 15;

/** Surfaces — read from the framework repo at v1.93.0. */
export const SLASH_COMMANDS = 40; // maddu-* slash on-ramps installed per repo
export const COCKPIT_ROUTES = 42;
export const ARCHITECTURE_LAYERS = 14; // the site's ontology layering

/** Releases — derived from releases.ts. */
export const RELEASE_COUNT: number = RELEASES.length;
