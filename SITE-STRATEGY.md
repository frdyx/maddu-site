# maddu-site strategy — from reference manual to marketing site that keeps its docs soul

**Written:** 2026-07-06 · from a full audit of the site (all 17 pages) against the canonical
`maddu` repo at **v1.93.0**. Supersedes `MADDU-UPDATE-BRIEF.md` (v1.86-era; site is now at
v1.92.2, so only the v1.93.0 delta + copy overhaul remain).

## Diagnosis (one paragraph)

The site is over-built as *reference* and under-built as *marketing*. The scaffolding is
genuinely strong — component system, cross-links, color-coded ontology, `/manifesto` (the
best-written page), `/threat-model` (the best-structured dense page). But top-of-funnel pages
bury human benefit statements under 150-word run-on enumerations; marquee features (fleet,
autonomy, focus, learn-sync, hooks, ci, cost-budget, worktree lanes) live as sub-clauses inside
cards; stat numbers are hand-copied per page and now contradict each other (69 vs 60 gates,
68 vs 66 vs 62 verbs, "repo public" vs "coming soon") — fatal on a site whose pitch is
*auditability*. The fix is not deleting copy; it is **re-homing** it: one-sentence purposes on
hubs, full detail on dedicated pages, numbers from one source.

## North star

> **Docs-grade truth, marketing-grade pacing.** Every page opens with a benefit a human can
> read in five seconds; every claim traces to the repo; every dense enumeration becomes chips,
> cards, or its own page. The manifesto's rhythm is the sitewide voice template; the
> threat-model's card schema is the template for dense material.

## Pillars

### P0 — Truth alignment (v1.93.0)  ✅ trust before beauty
- **Single-source all stats**: `src/data/stats.ts` exports version, verb count, areas, gates,
  audit checks, event types, routes, etc. Every page imports; no hand-typed numbers. Kills the
  69/60-gates and 68/66/62-verbs bug class permanently.
- Regenerate `capabilities-detail.json` from the repo (`scripts/gen-capabilities.mjs`) —
  picks up verb #69 (`export --otel`) and current charter text.
- Fix contradictions: gates → **70**, version → **1.93.0**, repo IS public (fix `/404` +
  `/privacy` "coming soon"), cockpit-route count from one source.
- Add the v1.93.0 operator-facing surface: **worktree lanes** (`lane claim --worktree`,
  release dispositions `merged|abandoned|keep`, `worktree-lane-coherence` doctor gate,
  split-spine safety).

### P1 — De-densify the core pages
- `/capabilities` area purposes: 150-word run-ons → **one 12-word sentence per area**; the
  full charter purpose moves into a collapsed "charter text" disclosure (copy preserved, not
  deleted) and stops being duplicated onto all 69 verb pages.
- Homepage: hero lede cut to ~35 words; the buried positioning line — *"Tracing tools observe
  runs. Memory tools remember. Máddu governs how agents collaborate."* — promoted from a 14px
  footnote to a real three-column comparison strip.
- Every page opener: one short benefit sentence first, mechanism second.

### P2 — Feature landing pages (the missing marketing layer)
New `/features/` section — marketing-grade pages with docs DNA (spine events + CLI shown on
every one). Hub + 8 pages:

| Slug | Feature | Hook |
|---|---|---|
| `fleet` | Fleet view + staged upgrades | "Know which of your N installs are stale — and push updates that stop on the first red." |
| `autonomy` | Earned autonomy | "Trust is earned on the record, not asserted." |
| `focus` | Focus Director | "Notices drift from the goal — and asks, never blocks." |
| `learn` | Failure learning + federation | "A fix learned once propagates across the fleet." |
| `discipline` | Session discipline (hooks + agents + pre-compaction checkpoint) | "Never start building unrecorded." |
| `ci` | Governance as a merge requirement | "The LLM-free gate rail — red only on gates *you* pinned." |
| `cost` | Cost accounting + budget gate | "Catch a runaway session before it's a surprise." |
| `worktrees` | Worktree lanes (new in 1.93) | "Parallel agents, isolated checkouts, one spine." |

Page template (reuses threat-model/manifesto patterns): benefit H1 → 40-word lede → CLI chip →
"the problem" (3 sentences) → 3-4 what-it-does cards → spine-event trace (`EventStream` /
`Annotated`) → related-verb links → CTA.

### P3 — Marketing components + conversion path
- **StatBand** (renders from `stats.ts`), **CompareStrip** (tracing/memory/Máddu),
  **CtaBlock** (install + GitHub — today PageNext only routes *sideways* to more docs; no page
  ends in a conversion).
- Nav gains **Features**; homepage gains the feature grid linking to `/features/*`.

### Deferred (documented, not done now)
- `/security` vs `/threat-model` ~70% overlap → make security the overview. (Mechanical but
  large; do as its own slice.)
- Changelog "highlights" curated view over the 122-entry raw log.
- Cockpit showcase page — needs real screenshots; most demo-able asset, currently invisible
  outside `/welcome/`.
- Rethink the `/welcome/` first-visit interstitial (new visitors never see the real hero
  first).

## Copy rules (sitewide, from the audit)
1. Openers ≤ 40 words, benefit first. 2. No paragraph carries more than one idea + one
parenthetical. 3. Enumerations of 4+ items become chips, tables, or bullets — never commas.
4. Keep the manifesto's declarative cadence ("Inside the machine, you can audit. Outside it,
you can hope."). 5. Numbers only via `stats.ts`. 6. Never headline multi-agent orchestration —
the discipline loop is the product; orchestration is the opt-in layer.
