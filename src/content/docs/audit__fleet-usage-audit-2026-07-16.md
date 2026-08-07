---
title: "Fleet usage audit — 2026-07-16 (Codex analysis)"
slug: "audit/fleet-usage-audit-2026-07-16"
group: "Working notes"
order: 500
description: "Method: all 22 registered workspaces' spines parsed directly (lanes catalog vs claims, event types, gates, learn corrections, sessions/slice-stops) + maddu insights / maddu fleet…"
sourceFile: "audit/fleet-usage-audit-2026-07-16.md"
sourceUrl: "https://github.com/frdyx/maddu/blob/main/docs/audit/fleet-usage-audit-2026-07-16.md"
---
Method: all 22 registered workspaces' spines parsed directly (lanes catalog vs claims,
event types, gates, learn corrections, sessions/slice-stops) + [`maddu insights`](/capabilities/insights) /
[`maddu fleet`](/capabilities/fleet) cross-project datasets → raw stats in
`fleet-usage-audit-2026-07-16-stats.md` → analyzed by Codex (gpt-5.6-sol, read-only).

## 1. Load-bearing vs. defined-but-unused

- **Core health plumbing earns its place by reach:** `GATE_RAN` appears in all 22 repos with 10,229 passes, 0 failures, and 104 "other" outcomes; `DOCTOR_REPORT` is top-eight in all 22; `FRAMEWORK_BOOTED` is top-eight in 21.
- **The session/lane/slice ritual earns its place where activated:** 16/21 non-framework workspaces recorded 131 sessions and 332 slice-stops. Handoffs are top-eight in 10 consumer repos and triggers in 9.
- **Plans, tasks, and pipelines earn modular—not universal—status:** plan events are prominent in 3 consumers, task lifecycle events in 2, and pipeline stages in 3. These are real but specialized workflows.
- **Posture/edge events should not be judged by frequency alone:** 70/182 types are annotated dormant-by-design. Their value must come from tested protection, not adoption counts.
- **The event vocabulary is over-broad or under-instrumented:** only 92/182 types ever fired, leaving 90 never observed. `SKILL_INJECTION_REFUSED` is the sole explicitly dead, non-dormant type.
- **The learn subsystem currently looks framework-self-dev-only:** all 11 corrections are in `maddu`; all 21 non-framework repos have zero.
- **Audit/focus surfaces look self-dev-shaped, not proven fleet primitives:** `maddu` has 1,278 `AUDIT_REPORT` and 258 `FOCUS_TAGGED` events in its top eight, while neither appears in any consumer top-eight. This is suggestive, not proof of zero consumer firing.
- **The 72-verb CLI cannot be classified reliably from transcripts:** the supplied counts measure mentions, include self-development, and do not establish executions or successful outcomes.

## 2. Lane/domain story

- Across the 21 non-framework workspaces, 112/147 default catalog placements were never claimed: **76% dead-on-arrival**.
- Of 98 distinct consumer lane claims, 63 were ad hoc: **64% ad hoc**, versus only 35 claims matching defaults.
- Default adoption is: backend 11/21 repos; architecture 5/21; frontend 5/21; infra 5/21; docs 5/21; tests 2/21; general 2/21.
- The mismatch is strongest in active projects: `cairn` has 6 dead defaults and 13 ad-hoc lanes; `snyggare-brand` 6 and 25; `krogpartner` 7 and 4; `maddu-site` 7 and 2.
- **Recommendation:** stop installing seven populated defaults. Start with an empty observed catalog while continuing to permit arbitrary claims.
- Generate suggestions from repository structure and recent claims, but require confirmation; code-derived domains alone would miss feature-, phase-, package-, and workflow-shaped lanes visible in the data.
- Auto-adopt a lane only after explicit pinning or repeated reuse. One-off `auto/<id>`, numeric, audit, and phase lanes should remain ephemeral rather than polluting the durable catalog.
- Preserve existing catalogs for compatibility, marking never-used entries as suggestions eligible for archival.
- **Hypothesis:** lanes are functioning primarily as temporary coordination scopes, not stable architectural domains; the current catalog models the framework designer's taxonomy rather than actual work.

## 3. Learn loop

- **Fact:** `maddu` produced 11 corrections; every consumer produced zero.
- **Fact:** low activity cannot fully explain this: `snyggare-brand` has 33 sessions/59 stops, `snyggare-agents` 25/41, `cogni` 16/31, and `noeticos` 15/32—still zero corrections.
- **Hypothesis:** candidate creation depends on explicit `learn` usage or narrowly detectable failed→succeeded command pairs that consumer workflows rarely expose.
- **Hypothesis:** consumers do not see a clear activation moment, destination, or payoff; slice-stop currently records completion without naturally asking whether a reusable correction was discovered.
- **Hypothesis:** the framework repo generates unusually rich environment and framework-specific failures—Windows paths, ports, duplicated docs, large files—so the feature may solve an authoring problem more than an orchestration problem.
- Transcript evidence does not contradict this: `learn` has 1,631 mentions across 10 directories, but those are mentions—including self-dev—not executions or accepted corrections.
- Make learn opportunistic: detect candidate failure→success pairs automatically, preview them at slice-stop/session close, and offer accept/edit/reject rather than requiring discovery of a separate verb.
- Measure downstream value: accepted consumer corrections, later retrievals, and recurrence reduction for the corrected failure.
- Trial criterion: if several active consumer repos still produce no accepted or reused corrections after an instrumented evaluation window, demote learn to an expert/self-development feature.

## 4. Installed but ritual-inactive segment

- The five repos (python-tiny, p6test, maddu-quiz, menu-designer, snyggare-signature) are 5/21 non-framework workspaces—24% of installations—with zero sessions, lane claims, and slice-stops.
- They nevertheless generated 2,257 events and 1,466 successful gate runs. Installation therefore creates substantial passive framework activity without intentional coordination use.
- This is not purely a "too new" cohort: `python-tiny` and `p6test` date from May 24, `maddu-quiz` from June 25, and `menu-designer` from June 30; only `snyggare-signature` was installed on the audit date.
- `python-tiny` is a fixture, so it should be separated from product activation metrics; the remaining older inactive projects still demonstrate a real activation gap.
- **Hypothesis:** onboarding proves installation health but does not reliably establish the first session→claim→slice-stop loop, possibly because hooks are absent, optional, or insufficiently visible.
- Track explicit funnel states: installed → healthy → session registered → first lane claimed → first slice-stop → repeat ritual.
- `doctor` should report the current activation state and one concrete next action; passive gate traffic must not count as adoption.

## 5. Instrumentation and data quality

- **Version provenance:** `fleet` reports examples at 1.15.0 while `insights` reports 0.19.0/1.1.0/1.2.3. Use one canonical installed-version source or expose source, timestamp, and resolution rules on both surfaces.
- **Import skew:** 53,668/55,225 `snyggare` events—97.2%—are a one-time `TOKEN_USAGE_REPORTED` import. Its native-looking total should instead be 1,557 events plus a separately reported imported-usage dataset.
- Tag imports with batch/source metadata and exclude them by default from activity, recency, and event-volume rankings.
- **Transcript skew:** keyword mentions are not commands. Parse actual invocations with verb, workspace, timestamp, exit status, and actor; exclude quoted text, documentation, generated prompts, and framework self-dev by default.
- The `ci` example—1,700 mentions across only 4 directories—shows why raw mention volume is particularly misleading.
- **Role skew:** publish consumer-only, fixture-only, and framework-self-dev views; otherwise high self-dev usage can make experimental features look fleet-proven.
- **Event taxonomy reconciliation:** 92 fired + 70 dormant + 1 dead totals 163, leaving 19/182 unexplained if categories are intended to be disjoint. Publish mutually exclusive states or document overlaps.
- **Gate semantics:** 10,229 passes, 0 failures, and 104 "other" outcomes demonstrate execution, not discrimination. Name every non-pass state and verify that intentional failures reach the telemetry.

## 6. Ranked top-10 recommendations

1. **CHANGE onboarding:** expose and optimize the activation funnel—5/21 non-framework installs produced 2,257 events but zero sessions, claims, or stops.
2. **CHANGE lane catalogs:** replace seven installed defaults with observed/suggested catalogs—112/147 default placements were dead.
3. **DOUBLE-DOWN on the core ritual:** simplify around session→claim→handoff→slice-stop—16/21 consumers produced 131 sessions and 332 stops.
4. **CHANGE activity metrics:** separate imported usage from native events—`TOKEN_USAGE_REPORTED` forms 97.2% of `snyggare`.
5. **CHANGE version reporting:** establish one version SSOT—`fleet` and `insights` disagree for the same installations.
6. **CHANGE learn into an automatic, measured trial:** surface candidates at stop/close—11 self-dev corrections versus 0 across 21 consumers.
7. **CHANGE event analytics:** segment self-dev/fixtures/consumers and reconcile statuses—92/182 fired, while 19 types are unaccounted for by the summary taxonomy.
8. **CHANGE gate instrumentation:** test failure capture and enumerate "other"—10,229 passes, 0 failures, 104 other.
9. **CHANGE CLI telemetry:** record executions and outcomes before pruning 72 verbs—the current 161-file dataset counts mentions only.
10. **CUT or correctly classify `SKILL_INJECTION_REFUSED`:** it is the fleet's single explicitly dead, non-dormant event type.
