// area-purposes.ts — the human one-liner for each charter purpose area.
// The full charter purpose text (the run-on the framework itself maintains)
// stays available behind a disclosure on /capabilities and the verb pages;
// these are the site's own 12-second versions, shared so hub cards and all
// 69 generated verb pages say the same thing.

export const AREA_ONE_LINERS: Record<string, string> = {
  orchestration:
    'The one canonical loop — register a session, claim a lane, run a slice, release. Each transition is one event on the spine.',
  planning:
    'Decompose work into goals, phases, and plans that revise themselves — and hand off cleanly between sessions.',
  quality:
    'Gate every slice through tests, review, lint, and the doctor. Honesty enforced, not asserted.',
  tools:
    'The tool surface an agent reaches for mid-work: git, dependency installs, reusable skills, ad-hoc tasks.',
  trust:
    'Pin, verify, and approve everything that enters the workspace — and let lanes earn autonomy on the verified record.',
  memory:
    'Make work outlive the agent: mined corrections, portable blueprints, a debt ledger, honest cost accounting.',
  discovery:
    'Watch, search, and replay everything on the spine — across one repo or your whole fleet.',
  lifecycle:
    'Install, upgrade, and wire the spine into your repos and agents. Plumbing, not workflow.',
};
