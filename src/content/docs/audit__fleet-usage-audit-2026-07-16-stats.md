---
title: "Máddu fleet usage audit — raw stats (2026-07-16)"
slug: "audit/fleet-usage-audit-2026-07-16-stats"
group: "Working notes"
order: 500
description: "Scope: 22 registered workspaces (21 with spines + 1 new), all spine events parsed directly; plus maddu insights cross-project dataset (defined 182 event types) and transcript…"
sourceFile: "audit/fleet-usage-audit-2026-07-16-stats.md"
sourceUrl: "https://github.com/frdyx/maddu/blob/main/docs/audit/fleet-usage-audit-2026-07-16-stats.md"
---
Scope: 22 registered workspaces (21 with spines + 1 new), all spine events parsed directly; plus [`maddu insights`](/capabilities/insights) cross-project dataset (defined 182 event types) and transcript verb-mention counts (161 files, mentions not executions, includes framework self-dev).

## Per-workspace spine profile

| repo | role | events | span | sessions | slice-stops | lanes defined | claimed distinct | dead catalog lanes | ad-hoc lanes | gates P/F/other | corrections |
|---|---|---|---|---|---|---|---|---|---|---|---|
| memo | fixture | 1247 | 2026-05-23→2026-07-11 | 1 | 2 | 7 | 4 | 4 | 1 | 806/0/11 | 0 |
| python-tiny | fixture | 930 | 2026-05-24→2026-07-11 | 0 | 0 | 7 | 0 | 7 | 0 | 595/0/11 | 0 |
| p6test | project | 931 | 2026-05-24→2026-07-11 | 0 | 0 | 7 | 0 | 7 | 0 | 611/0/3 | 0 |
| snyggare | project | 55225 | 2026-05-21→2026-07-15 | 7 | 31 | 7 | 5 | 3 | 1 | 952/0/8 | 0 |
| wify-mic | project | 1818 | 2026-05-24→2026-07-11 | 2 | 21 | 7 | 4 | 3 | 0 | 1411/0/3 | 0 |
| noeticos | project | 1665 | 2026-05-24→2026-07-11 | 15 | 32 | 7 | 4 | 4 | 1 | 1117/0/14 | 0 |
| lulu-planner | project | 1186 | 2026-06-01→2026-07-14 | 8 | 29 | 7 | 4 | 5 | 2 | 667/0/5 | 0 |
| crawl | project | 870 | 2026-06-08→2026-07-11 | 3 | 11 | 7 | 2 | 6 | 1 | 615/0/3 | 0 |
| cogni | project | 1177 | 2026-06-11→2026-07-11 | 16 | 31 | 7 | 9 | 2 | 4 | 788/0/4 | 0 |
| maddu | project | 4617 | 2026-05-21→2026-07-16 | 84 | 265 | 19 | 45 | 8 | 34 | 237/0/4 | 11 |
| ados | project | 861 | 2026-06-18→2026-07-11 | 2 | 26 | 7 | 7 | 5 | 5 | 475/0/5 | 0 |
| maddu-quiz | project | 189 | 2026-06-25→2026-07-11 | 0 | 0 | 7 | 0 | 7 | 0 | 120/0/2 | 0 |
| cairn | project | 206 | 2026-06-28→2026-07-11 | 7 | 15 | 7 | 14 | 6 | 13 | 61/0/1 | 0 |
| menu-designer | project | 129 | 2026-06-30→2026-07-11 | 0 | 0 | 7 | 0 | 7 | 0 | 68/0/1 | 0 |
| snyggare-agents | project | 591 | 2026-07-04→2026-07-16 | 25 | 41 | 7 | 10 | 1 | 4 | 245/0/3 | 0 |
| maddu-site | project | 292 | 2026-07-06→2026-07-11 | 5 | 24 | 7 | 2 | 7 | 2 | 166/0/2 | 0 |
| research-site | project | 263 | 2026-07-06→2026-07-14 | 2 | 1 | 7 | 1 | 6 | 0 | 214/0/3 | 0 |
| snyggare-brand | project | 468 | 2026-07-06→2026-07-14 | 33 | 59 | 7 | 26 | 6 | 25 | 130/0/1 | 0 |
| krogpartner | project | 803 | 2026-07-09→2026-07-11 | 3 | 7 | 7 | 4 | 7 | 4 | 661/0/12 | 0 |
| mcgs | project | 173 | 2026-07-09→2026-07-11 | 1 | 1 | 7 | 1 | 6 | 0 | 145/0/4 | 0 |
| converter-agent | project | 86 | 2026-07-10→2026-07-11 | 1 | 1 | 7 | 1 | 6 | 0 | 73/0/2 | 0 |
| snyggare-signature | project | 78 | 2026-07-16→2026-07-16 | 0 | 0 | 7 | 0 | 7 | 0 | 72/0/2 | 0 |

## Dead catalog lanes per repo (defined in lanes/catalog.json, never claimed)

- **memo**: frontend, infra, tests, general
- **python-tiny**: architecture, frontend, backend, infra, tests, docs, general
- **p6test**: architecture, frontend, backend, infra, tests, docs, general
- **snyggare**: frontend, infra, tests
- **wify-mic**: architecture, tests, docs
- **noeticos**: architecture, tests, docs, general
- **lulu-planner**: frontend, infra, tests, docs, general
- **crawl**: architecture, frontend, infra, tests, docs, general
- **cogni**: architecture, general
- **maddu**: bridge-server, auth-providers, briefs, search-retrieval, runtime-integration, tools, ops-automation, shell
- **ados**: architecture, infra, tests, docs, general
- **maddu-quiz**: architecture, frontend, backend, infra, tests, docs, general
- **cairn**: architecture, frontend, infra, tests, docs, general
- **menu-designer**: architecture, frontend, backend, infra, tests, docs, general
- **snyggare-agents**: general
- **maddu-site**: architecture, frontend, backend, infra, tests, docs, general
- **research-site**: architecture, frontend, backend, tests, docs, general
- **snyggare-brand**: architecture, frontend, backend, infra, tests, general
- **krogpartner**: architecture, frontend, backend, infra, tests, docs, general
- **mcgs**: frontend, backend, infra, tests, docs, general
- **converter-agent**: architecture, frontend, infra, tests, docs, general
- **snyggare-signature**: architecture, frontend, backend, infra, tests, docs, general

## Ad-hoc lanes per repo (claimed but not in the catalog)

- **memo**: review
- **snyggare**: menu-skill
- **noeticos**: auto/18d1c8
- **lulu-planner**: media-org-visibility, rls-hardening
- **crawl**: harness
- **cogni**: audit-full-system, cogni-pipeline-fix, vscode-copilot-ingest, cogni-retrieval-iteration
- **maddu**: 1, tools-hardening, worker-hardening, team-sync-design, 12c-phase6-docs-cockpit, exp-p0-design, exp-p1-experience, exp-p2-signals, exp-p3-evolve, exp-p4-learn-spine, exp-p5-export, exp-p6-surfacing, docs, framework, cockpit-decomp, discipline, auto/ea836e, audit, auto/a98e80, p0-security, p0b-bridge-auth, auto/4644ba, spine-tamper-evidence, p2-discipline-honesty, auto/906988, p3-verification, auto/b1f8f3, feat/p4-gate-scope, p5-secret-scrub-doc-drift, auto/a824e2, p5-finalization, auto/d855dd, auto/ada6d6, fleet-usage-audit
- **ados**: scaffold, shared-contracts, data-layer, backend-api, generation
- **cairn**: m4-scorer, m4-effect-ledger, m4-effect-classify, preflight-gate, overlay-loop, overlay-ledger-receipt, live-runtime-adapter, hook-state-persistence, adapter-trust-hardening, hook-decision-log, hook-real-scorer, gate-corroboration, 1b-scorer
- **snyggare-agents**: factory-changelog, factory-component-library, snyggare-agency-site, krogpartner-html-import
- **maddu-site**: docs-layout-draft, site-content
- **snyggare-brand**: pkg-shared, pkg-web, pkg-server, phase1-wiring, svc-generation, svc-intake, spike-image, jobs-worker, svc-campaigns, api-workroom, brand-studio-ui, brand-agent-phaseA, brand-agent-phaseB, brand-agent-phaseC, brand-agent-phaseD, phase-d, agent-media-gate, studio-mobile-brand-editing, social-planner-app, social-planner-worker, worker-intake-phase2a, worker-intake-phase2b, app-studio-phase2c, app-studio-onboarding, worker-ig-feed-analysis
- **krogpartner**: krogpartner-website-growth-workflow, krogpartner-landingpage-setup, krogpartner-formula-baseline, krogpartner-system-revision

## Top event types per repo (top 8)

- **memo**: GATE_RAN 817 · FRAMEWORK_BOOTED 284 · DOCTOR_REPORT 28 · PLAN_PHASE_COMPLETED 18 · COORDINATOR_PHASE_STARTED 12 · COORDINATOR_PHASE_COMPLETED 12 · TOOL_INVOKED 9 · AGENT_FILE_SYNCED 6
- **python-tiny**: GATE_RAN 606 · FRAMEWORK_BOOTED 283 · DOCTOR_REPORT 23 · AGENT_FILE_SYNCED 5 · SLASH_COMMANDS_SYNCED 5 · FRAMEWORK_UPGRADED 4 · TOOL_REFUSED 3 · FRAMEWORK_INSTALLED 1
- **p6test**: GATE_RAN 614 · FRAMEWORK_BOOTED 278 · DOCTOR_REPORT 23 · AGENT_FILE_SYNCED 5 · SLASH_COMMANDS_SYNCED 5 · FRAMEWORK_UPGRADED 4 · FRAMEWORK_INSTALLED 1 · TRUST_AUDIT_RAN 1
- **snyggare**: TOKEN_USAGE_REPORTED 53668 · GATE_RAN 960 · FRAMEWORK_BOOTED 279 · HANDOFF_SET 41 · PIPELINE_STAGE_ENTERED 32 · PIPELINE_STAGE_EXITED 32 · DOCTOR_REPORT 31 · SLICE_STOP 31
- **wify-mic**: GATE_RAN 1414 · FRAMEWORK_BOOTED 255 · DOCTOR_REPORT 39 · LANE_CLAIMED 21 · SLICE_STOP 21 · LANE_RELEASED 21 · SESSION_HEARTBEAT 7 · AGENT_FILE_SYNCED 5
- **noeticos**: GATE_RAN 1131 · FRAMEWORK_BOOTED 237 · TASK_CREATED 33 · SLICE_STOP 32 · TASK_UPDATED 31 · TASK_COMPLETED 31 · DOCTOR_REPORT 30 · HANDOFF_SET 20
- **lulu-planner**: GATE_RAN 672 · FRAMEWORK_BOOTED 236 · PLAN_PHASE_COMPLETED 56 · HANDOFF_SET 34 · SLICE_STOP 29 · DOCTOR_REPORT 24 · TRIGGER_FIRED 24 · PLAN_CREATED 15
- **crawl**: GATE_RAN 618 · FRAMEWORK_BOOTED 179 · DOCTOR_REPORT 23 · SLICE_STOP 11 · TRUST_VIOLATION_DETECTED 7 · AGENT_FILE_SYNCED 5 · SLASH_COMMANDS_SYNCED 5 · FRAMEWORK_UPGRADED 4
- **cogni**: GATE_RAN 792 · FRAMEWORK_BOOTED 130 · HANDOFF_SET 36 · SLICE_STOP 31 · TRIGGER_FIRED 31 · DOCTOR_REPORT 26 · PIPELINE_STAGE_ENTERED 24 · PIPELINE_STAGE_EXITED 24
- **maddu**: AUDIT_REPORT 1278 · DOCTOR_REPORT 682 · TRIGGER_FIRED 519 · HANDOFF_SET 310 · SLICE_STOP 265 · FOCUS_TAGGED 258 · GATE_RAN 241 · FRAMEWORK_BOOTED 116
- **ados**: GATE_RAN 480 · FRAMEWORK_BOOTED 111 · HANDOFF_SET 32 · TRIGGER_FIRED 31 · ARCHITECTURE_SCANNED 28 · SLICE_STOP 26 · SLICE_SCOPE_DECLARED 25 · LANE_CLAIMED 23
- **maddu-quiz**: GATE_RAN 122 · FRAMEWORK_BOOTED 62 · DOCTOR_REPORT 2 · FRAMEWORK_INSTALLED 1 · AGENT_FILE_SYNCED 1 · SLASH_COMMANDS_SYNCED 1
- **cairn**: GATE_RAN 62 · FRAMEWORK_BOOTED 56 · HANDOFF_SET 25 · SLICE_STOP 15 · TRIGGER_FIRED 15 · LANE_CLAIMED 14 · SESSION_AUTO_REGISTERED 7 · GOAL_DECLARED 7
- **menu-designer**: GATE_RAN 69 · FRAMEWORK_BOOTED 56 · FRAMEWORK_INSTALLED 1 · AGENT_FILE_SYNCED 1 · SLASH_COMMANDS_SYNCED 1 · DOCTOR_REPORT 1
- **snyggare-agents**: GATE_RAN 248 · FRAMEWORK_BOOTED 56 · HANDOFF_SET 49 · TRIGGER_FIRED 42 · SLICE_STOP 41 · SESSION_AUTO_REGISTERED 24 · SESSION_HEARTBEAT 18 · TASK_CREATED 14
- **maddu-site**: GATE_RAN 168 · FRAMEWORK_BOOTED 30 · HANDOFF_SET 28 · TRIGGER_FIRED 25 · SLICE_STOP 24 · SESSION_AUTO_REGISTERED 4 · SESSION_CLOSED 3 · DOCTOR_REPORT 2
- **research-site**: GATE_RAN 217 · FRAMEWORK_BOOTED 30 · DOCTOR_REPORT 3 · SESSION_AUTO_REGISTERED 2 · TRIGGER_FIRED 2 · FRAMEWORK_INSTALLED 1 · AGENT_FILE_SYNCED 1 · SLASH_COMMANDS_SYNCED 1
- **snyggare-brand**: GATE_RAN 131 · HANDOFF_SET 79 · TRIGGER_FIRED 63 · SLICE_STOP 59 · SESSION_AUTO_REGISTERED 33 · LANE_CLAIMED 29 · FRAMEWORK_BOOTED 28 · COMPACTION_CHECKPOINT 12
- **krogpartner**: GATE_RAN 673 · PIPELINE_STAGE_ENTERED 32 · PIPELINE_STAGE_EXITED 32 · DOCTOR_REPORT 9 · TRIGGER_FIRED 8 · SLICE_STOP 7 · HANDOFF_SET 7 · FRAMEWORK_BOOTED 7
- **mcgs**: GATE_RAN 149 · FRAMEWORK_BOOTED 7 · PLAN_PHASE_ADDED 4 · DOCTOR_REPORT 2 · FRAMEWORK_INSTALLED 1 · AGENT_FILE_SYNCED 1 · SLASH_COMMANDS_SYNCED 1 · SESSION_AUTO_REGISTERED 1
- **converter-agent**: GATE_RAN 75 · FRAMEWORK_BOOTED 2 · FRAMEWORK_INSTALLED 1 · AGENT_FILE_SYNCED 1 · SLASH_COMMANDS_SYNCED 1 · DOCTOR_REPORT 1 · SESSION_AUTO_REGISTERED 1 · LANE_CLAIMED 1
- **snyggare-signature**: GATE_RAN 74 · FRAMEWORK_INSTALLED 1 · AGENT_FILE_SYNCED 1 · SLASH_COMMANDS_SYNCED 1 · DOCTOR_REPORT 1

## Learn corrections (fleet-wide — only where any exist)

### maddu (11)
- In the Bash tool, always use forward-slash paths (C:/Users/FRDY/...) — backslash paths get stripped by bash and fail (`cd C:\Users\...` becomes `C:UsersFRDY...`).
- Write temp scripts/files into the project dir (e.g. _census.mjs) not /tmp — /tmp resolves to nonexistent C:\tmp under Windows bash.
- Don't use PowerShell here-string syntax (@'...'@) for git commit messages in the Bash tool — write the message to a temp file and use `git commit -F <file>`.
- Docs exist in two trees: top-level docs/ and template/maddu/docs/. Confirm which tree holds the target file before editing — they don't all mirror each other.
- Cockpit logic and styling live in template/maddu/cockpit/cockpit.js; there is no usable cockpit.css — edit/search cockpit.js.
- template/maddu/runtime/server.js is ~37k tokens (over the read limit) — read with offset/limit or grep, not whole-file.
- The Máddu server binds ports 4177 and 4184; [`maddu start`](/capabilities/start) fails EADDRINUSE if an instance is already running — check those ports before starting.
- Run the framework from a sibling test-consumer dir via the relative path `node ../maddu/bin/maddu.mjs`, and run [`maddu init`](/capabilities/init) before [`maddu upgrade`](/capabilities/upgrade) (upgrade errors if maddu.json is missing).
- GNU `timeout N` isn't usable in the Bash tool here (exits 125, 'Try timeout --help') — run the command directly or use `sleep`, don't prefix with `timeout`.
- The maddu server listens on ports 4177 and 4184; checking with netstat right after `maddu start` can miss them — sleep ~2s first, and grep both ports.
- Cockpit logic is decomposed (as of v1.71.0) across template/maddu/cockpit/cockpit.js (the composition root: route registry, ctx seam, router, boot) + ~16 cockpit-*.js sibling ES modules (per-cluster route views in cockpi

## Cross-project event-type utilization (from maddu insights)

Defined 182 · ever fired 92 · dead (never fired anywhere, not dormant-by-design): 1 — SKILL_INJECTION_REFUSED. 70 types are annotated dormant-by-design (posture/edge-only). Full per-type table in insights-events.txt.

## Verb mentions in transcripts (161 files; mentions, not executions; self-dev included)

lane 1164× (23 dirs) · init 891× (19 dirs) · doctor 1508× (23 dirs) · start 553× (23 dirs) · session 666× (23 dirs) · orient 3289× (29 dirs) · brief 630× (24 dirs) · register 828× (22 dirs) · slice 179× (11 dirs) · slice-stop 1873× (25 dirs) · events 216× (8 dirs) · test 471× (8 dirs) · review 162× (11 dirs) · cost 228× (10 dirs) · skill 467× (14 dirs) · loop 231× (10 dirs) · goal 1335× (18 dirs) · plan 751× (17 dirs) · coordinator 200× (12 dirs) · pipeline 553× (17 dirs) · help 355× (19 dirs) · handoff 824× (19 dirs) · architecture 1466× (8 dirs) · status 562× (16 dirs) · export 570× (10 dirs) · import 159× (9 dirs) · insights 339× (7 dirs) · phase 297× (14 dirs) · team 134× (9 dirs) · advise 200× (11 dirs) · suggest 171× (12 dirs) · search 109× (8 dirs) · task 200× (13 dirs) · memory 228× (8 dirs) · learn 1631× (10 dirs) · blueprint 440× (8 dirs) · debt 622× (8 dirs) · git 159× (8 dirs) · self-test 858× (7 dirs) · format 96× (6 dirs) · lint 96× (6 dirs) · install 200× (12 dirs) · mcp 238× (9 dirs) · plugin 188× (8 dirs) · governance 370× (9 dirs) · trust 384× (13 dirs) · audit 1995× (10 dirs) · log 119× (7 dirs) · mailbox 258× (10 dirs) · runtime 145× (14 dirs) · auth 89× (4 dirs) · upgrade 758× (11 dirs) · workspace 399× (15 dirs) · hooks 1436× (12 dirs) · agents 389× (12 dirs) · spine 1829× (9 dirs) · schedule 18× (4 dirs) · sources 22× (4 dirs) · ci 1700× (4 dirs) · model 651× (5 dirs) · autonomy 394× (4 dirs) · experience 476× (4 dirs) · evolve 327× (4 dirs) · fleet 884× (4 dirs) · approval 145× (4 dirs) · stop 49× (4 dirs) · focus 463× (3 dirs) · global 102× (3 dirs) · checkpoint 89× (3 dirs) · worker 66× (3 dirs) · usage 64× (3 dirs) · bridges 26× (4 dirs)

## Known data discrepancies (meta-findings)

- [`maddu fleet`](/capabilities/fleet) reports snyggare/memo/wify-mic etc. at version 1.15.0 while `maddu insights` reports their installedVersion as 0.19.0/1.1.0/1.2.3 — the two surfaces read different sources and disagree.
- snyggare total (55225) is dominated by TOKEN_USAGE_REPORTED (53668) from a one-time usage import — activity metrics that include it are misleading.
- insights verb counts are transcript keyword mentions, so heavily inflated by framework self-development sessions (e.g. `ci` 1700× across only 4 session dirs).
