// Static search index. Same shape the cockpit palette uses internally
// (kind / title / desc / group / targetRoute), so the renderer can mirror
// cockpit logic 1:1.
//
// kind drives the glyph:
//   route  → ◆ when anchored / ◇ when bare page
//   sub    → ▸  (and the title gets a "· in ROUTE" suffix)
//   action → ▷
// group is the short lowercase tag rendered upper-cased on the right
// of each row (e.g. PAGE, RULES, SECURITY).

export type SearchKind = 'route' | 'sub' | 'action';

export interface SearchEntry {
  kind: SearchKind;
  title: string;
  url: string;
  group: string;
  keywords: string;
  /** Required for sub kind — name of the parent route, used in the title suffix */
  targetRoute?: string;
  /** Optional one-liner shown under the title (cockpit's `desc`) */
  desc?: string;
}

export const SEARCH_INDEX: SearchEntry[] = [
  // ── PAGES ────────────────────────────────────────────────────────
  { kind: 'route', title: 'Overview',      url: '/',              group: 'page', keywords: 'overview landing home maddu hero',                                  desc: 'Hero + the substrate loop in motion' },
  { kind: 'route', title: 'How it works',  url: '/how-it-works',  group: 'page', keywords: 'how it works substrate pipeline coordinator slice',                 desc: 'Walk the canonical flow stage by stage' },
  { kind: 'route', title: 'Architecture',  url: '/architecture',  group: 'page', keywords: 'architecture ontology layers thirteen 13',                          desc: 'The 13 layers, color-coded by purpose' },
  { kind: 'route', title: 'Security',      url: '/security',      group: 'page', keywords: 'security defenses structural posture',                              desc: '7 structural enforcement points' },
  { kind: 'route', title: 'Threat model',  url: '/threat-model',  group: 'page', keywords: 'threat model attack defense residual risk vulnerability',           desc: 'Threats named, defenses named, residual risk named' },
  { kind: 'route', title: 'Governance',    url: '/governance',    group: 'page', keywords: 'governance gauntlet tiers strict standard relaxed approval',         desc: 'The gauntlet and three tiers that fit it' },
  { kind: 'route', title: 'Hard rules',    url: '/hard-rules',    group: 'page', keywords: 'hard rules invariants 8+1 charter posture absent',                  desc: 'The 8+1 invariants in full' },
  { kind: 'route', title: 'Capabilities',  url: '/capabilities',  group: 'page', keywords: 'capabilities verbs ontology commands 53 cli',                       desc: 'Every verb earns its place — 53 across 8 areas' },
  { kind: 'route', title: 'Install',       url: '/install',       group: 'page', keywords: 'install setup npx npm github deferred private',                    desc: 'Coming soon when the repo flips public' },
  { kind: 'route', title: 'Changelog',     url: '/changelog',     group: 'page', keywords: 'changelog releases history versions arc v0.17 v1.0 v1.3',           desc: '19 releases — v0.17.1 → v1.3.0' },
  { kind: 'route', title: 'Manifesto',     url: '/manifesto',     group: 'page', keywords: 'manifesto why prose position bet north star essay long form',      desc: 'The position, in prose · 7 sections' },
  { kind: 'route', title: 'Brand',         url: '/brand',         group: 'page', keywords: 'brand assets logo color tokens typography mark wordmark plex',     desc: 'Logo · color tokens · typography stack · downloads' },
  { kind: 'route', title: 'Privacy',       url: '/privacy',       group: 'page', keywords: 'privacy cookies analytics no telemetry posture',                    desc: 'No cookies · no analytics · no third-party scripts' },

  // ── ARCHITECTURE LAYERS (sub of Architecture) ────────────────────
  { kind: 'sub', title: 'Invariants — the identity',          url: '/architecture#invariants',  group: 'architecture', targetRoute: 'Architecture', keywords: 'invariants hard rules identity 8+1 doctor enforced', desc: 'The 8+1 hard rules · doctor-enforced' },
  { kind: 'sub', title: 'Operator surface',                    url: '/architecture#operator',    group: 'architecture', targetRoute: 'Architecture', keywords: 'operator slash natural language CLI no learning curve', desc: 'Slash + natural language · zero learning curve' },
  { kind: 'sub', title: 'Agent runtime',                       url: '/architecture#runtime',     group: 'architecture', targetRoute: 'Architecture', keywords: 'runtime agent claude codex gemini vendor agnostic', desc: 'Any agent CLI plugs in · runtime-agnostic' },
  { kind: 'sub', title: 'Execution topology',                  url: '/architecture#execution',   group: 'architecture', targetRoute: 'Architecture', keywords: 'execution pipelines coordinator team autopilot', desc: 'Pipelines × 3 · coordinator · team · autopilot' },
  { kind: 'sub', title: 'Substrate loop',                      url: '/architecture#substrate',   group: 'architecture', targetRoute: 'Architecture', keywords: 'substrate loop register claim slice stop release close', desc: 'register · claim · slice · stop · release · close' },
  { kind: 'sub', title: 'Lanes',                               url: '/architecture#lanes',       group: 'architecture', targetRoute: 'Architecture', keywords: 'lanes concurrency without locks rule 8 mailbox', desc: 'Concurrency without locks · Rule #8' },
  { kind: 'sub', title: 'The gauntlet',                        url: '/architecture#gauntlet',    group: 'architecture', targetRoute: 'Architecture', keywords: 'gauntlet rule 9 allowlist cooldown trigger fired auto', desc: 'Rule #9 made operable' },
  { kind: 'sub', title: 'Worker isolation',                    url: '/architecture#workers',     group: 'architecture', targetRoute: 'Architecture', keywords: 'worker subprocess isolation env allowlist secret scan', desc: 'Provider calls live here — and only here' },
  { kind: 'sub', title: 'The spine',                           url: '/architecture#spine',       group: 'architecture', targetRoute: 'Architecture', keywords: 'spine ndjson event log single source of truth', desc: 'Single source of truth · append-only NDJSON' },
  { kind: 'sub', title: 'Projections',                         url: '/architecture#projections', group: 'architecture', targetRoute: 'Architecture', keywords: 'projections plans kanban receipts derived rebuildable', desc: 'Rebuildable · never authoritative' },
  { kind: 'sub', title: 'Security & supply chain',             url: '/architecture#security',    group: 'architecture', targetRoute: 'Architecture', keywords: 'security supply chain trust mcp pin sha256', desc: 'Structural · not advisory' },
  { kind: 'sub', title: 'Quality & enforcement',               url: '/architecture#quality',     group: 'architecture', targetRoute: 'Architecture', keywords: 'quality doctor audit gates 54 stress harness', desc: '54 gates on every install and upgrade' },
  { kind: 'sub', title: 'Memory & accounting',                 url: '/architecture#memory',      group: 'architecture', targetRoute: 'Architecture', keywords: 'memory accounting hindsight skills receipt log cost', desc: 'Work outlives the agent' },
  { kind: 'sub', title: 'Cockpit',                             url: '/architecture#cockpit',     group: 'architecture', targetRoute: 'Architecture', keywords: 'cockpit observe replay static page browser', desc: 'Observe & replay · never command' },

  // ── HARD RULES (sub of Hard rules) ───────────────────────────────
  { kind: 'sub', title: 'Rule #1 — Files-only state',           url: '/hard-rules', group: 'rules', targetRoute: 'Hard rules', keywords: 'rule 1 files only state ndjson no sqlite no db', desc: 'No SQLite, no embedded DB, no hosted DB' },
  { kind: 'sub', title: 'Rule #2 — Append-only event spine',    url: '/hard-rules', group: 'rules', targetRoute: 'Hard rules', keywords: 'rule 2 append only event spine verifiable no auto repair', desc: 'Verifiable · never auto-repaired' },
  { kind: 'sub', title: 'Rule #3 — No hosted backends',         url: '/hard-rules', group: 'rules', targetRoute: 'Hard rules', keywords: 'rule 3 no hosted backend saas telemetry relay cloud', desc: 'No SaaS, no telemetry, no relay' },
  { kind: 'sub', title: 'Rule #4 — No broad new dependencies',  url: '/hard-rules', group: 'rules', targetRoute: 'Hard rules', keywords: 'rule 4 no broad new dependencies deps node stdlib', desc: 'Node stdlib where possible' },
  { kind: 'sub', title: 'Rule #5 — No provider SDKs in app code', url: '/hard-rules', group: 'rules', targetRoute: 'Hard rules', keywords: 'rule 5 no provider sdk anthropic openai google', desc: 'SDKs live in worker subprocesses only' },
  { kind: 'sub', title: 'Rule #6 — No token export',            url: '/hard-rules', group: 'rules', targetRoute: 'Hard rules', keywords: 'rule 6 no token export device bound oauth keystore', desc: 'Tokens are device-bound by design' },
  { kind: 'sub', title: 'Rule #7 — Three-layer brand boundary', url: '/hard-rules', group: 'rules', targetRoute: 'Hard rules', keywords: 'rule 7 brand boundary framework app content', desc: 'Framework / app / content never mix' },
  { kind: 'sub', title: 'Rule #8 — Lane ownership',             url: '/hard-rules', group: 'rules', targetRoute: 'Hard rules', keywords: 'rule 8 lane ownership concurrency mailbox claim', desc: 'No two agents share a lane' },
  { kind: 'sub', title: 'Rule #9 — Auto-trigger gauntlet',      url: '/hard-rules', group: 'rules', targetRoute: 'Hard rules', keywords: 'rule 9 auto trigger gauntlet allowlist cooldown', desc: 'Permanent since v0.19.0' },

  // ── THREAT MODEL DEFENSES (sub of Threat model) ──────────────────
  { kind: 'sub', title: 'Worker subprocess isolation',          url: '/threat-model#worker-isolation',    group: 'security', targetRoute: 'Threat model', keywords: 'defense 1 worker subprocess isolation rule 5', desc: 'Provider calls live in workers · never framework code' },
  { kind: 'sub', title: 'Worker env allowlist',                 url: '/threat-model#env-allowlist',       group: 'security', targetRoute: 'Threat model', keywords: 'defense 2 env allowlist default deny token key secret', desc: 'Default-deny on secret-keyed env vars' },
  { kind: 'sub', title: 'Secret scan on tool argv',             url: '/threat-model#secret-scan',         group: 'security', targetRoute: 'Threat model', keywords: 'defense 3 secret scan argv pattern aws openai anthropic', desc: 'Raw values never logged · only the pattern name' },
  { kind: 'sub', title: 'Device-bound OAuth tokens',            url: '/threat-model#device-bound-tokens', group: 'security', targetRoute: 'Threat model', keywords: 'defense 4 device bound oauth tokens keystore export', desc: 'Rule #6 · no cross-machine sync' },
  { kind: 'sub', title: 'Supply-chain pinning',                 url: '/threat-model#supply-chain',        group: 'security', targetRoute: 'Threat model', keywords: 'defense 5 supply chain sha256 pin trust audit verify', desc: 'Rule #4 · every dep pinned by SHA256' },
  { kind: 'sub', title: 'MCP gallery — allowlist-only',         url: '/threat-model#mcp-gallery',         group: 'security', targetRoute: 'Threat model', keywords: 'defense 6 mcp gallery allowlist template provenance', desc: 'Curated templates only · no arbitrary URLs' },
  { kind: 'sub', title: 'The gauntlet (behavioral)',            url: '/threat-model#gauntlet',            group: 'security', targetRoute: 'Threat model', keywords: 'defense 7 gauntlet rule 9 behavioral trigger fired', desc: 'Prevents confidently-wrong propagation' },

  // ── GOVERNANCE TIERS (sub of Governance) ────────────────────────
  { kind: 'sub', title: 'Strict tier — consequential',          url: '/governance', group: 'governance', targetRoute: 'Governance', keywords: 'governance strict tier consequential production approval', desc: 'Every mutating action needs operator approval' },
  { kind: 'sub', title: 'Standard tier — default',              url: '/governance', group: 'governance', targetRoute: 'Governance', keywords: 'governance standard tier default daily development', desc: 'Allowlist + cooldown + slice-stop approval' },
  { kind: 'sub', title: 'Relaxed tier — exploration',           url: '/governance', group: 'governance', targetRoute: 'Governance', keywords: 'governance relaxed tier exploration scratch fast iteration', desc: 'Auto-fire allowed · audit trail still complete' },

  // ── CAPABILITY AREAS (sub of Capabilities) ──────────────────────
  { kind: 'sub', title: 'Orchestration core',                  url: '/capabilities#orchestration', group: 'verbs', targetRoute: 'Capabilities', keywords: 'capabilities orchestration session register lane slice slice-stop worker mailbox', desc: 'session · register · lane · slice · slice-stop · stop · worker · mailbox' },
  { kind: 'sub', title: 'Planning & autonomy',                 url: '/capabilities#planning',      group: 'verbs', targetRoute: 'Capabilities', keywords: 'capabilities planning autonomy pipeline plan goal phase loop coordinator team advise suggest', desc: 'pipeline · plan · goal · phase · loop · coordinator · team · advise · suggest' },
  { kind: 'sub', title: 'Quality & review',                    url: '/capabilities#quality',       group: 'verbs', targetRoute: 'Capabilities', keywords: 'capabilities quality review test lint format doctor', desc: 'review · test · lint · format · doctor' },
  { kind: 'sub', title: 'Default tools',                       url: '/capabilities#tools',         group: 'verbs', targetRoute: 'Capabilities', keywords: 'capabilities tools git install skill task', desc: 'git · install · skill · task' },
  { kind: 'sub', title: 'Supply-chain & trust',                url: '/capabilities#trust',         group: 'verbs', targetRoute: 'Capabilities', keywords: 'capabilities trust sources approval governance mcp', desc: 'trust · sources · approval · governance · mcp' },
  { kind: 'sub', title: 'Memory & accounting',                 url: '/capabilities#memory',        group: 'verbs', targetRoute: 'Capabilities', keywords: 'capabilities memory accounting cost usage log import', desc: 'memory · cost · usage · log · import' },
  { kind: 'sub', title: 'Discovery & observability',           url: '/capabilities#discovery',     group: 'verbs', targetRoute: 'Capabilities', keywords: 'capabilities discovery observability status events spine search brief help audit', desc: 'status · events · spine · search · brief · help · audit' },
  { kind: 'sub', title: 'Lifecycle & plumbing',                url: '/capabilities#lifecycle',     group: 'verbs', targetRoute: 'Capabilities', keywords: 'capabilities lifecycle plumbing init start upgrade workspace global runtime schedule checkpoint auth bridges', desc: 'init · start · upgrade · workspace · global · runtime · schedule · checkpoint · auth · bridges' },

  // ── PIPELINES (sub of How it works) ──────────────────────────────
  { kind: 'sub', title: 'ship-a-feature (default pipeline)',   url: '/how-it-works', group: 'pipeline', targetRoute: 'How it works', keywords: 'pipeline ship a feature default end to end', desc: 'orient → plan → coordinate → slice → test → review → land → account' },
  { kind: 'sub', title: 'fix-a-bug',                           url: '/how-it-works', group: 'pipeline', targetRoute: 'How it works', keywords: 'pipeline fix a bug something broken reproduce isolate', desc: 'reproduce → isolate → fix → verify → land' },
  { kind: 'sub', title: 'plan-and-delegate',                   url: '/how-it-works', group: 'pipeline', targetRoute: 'How it works', keywords: 'pipeline plan and delegate team fan out coordinator', desc: 'Team of N — fan out across disjoint lanes' },

  // ── MANIFESTO SECTIONS (sub of Manifesto) ────────────────────────
  { kind: 'sub', title: 'I — Capability gets the headlines',           url: '/manifesto', group: 'manifesto', targetRoute: 'Manifesto', keywords: 'manifesto section 1 i capability accountability gap headlines', desc: 'Accountability is the gap nobody is filling' },
  { kind: 'sub', title: 'II — Construction-lawsuit chain of custody',  url: '/manifesto', group: 'manifesto', targetRoute: 'Manifesto', keywords: 'manifesto section 2 ii construction lawsuit chain custody evidence', desc: 'The mental model that fits the problem' },
  { kind: 'sub', title: 'III — Local-first is a security posture',     url: '/manifesto', group: 'manifesto', targetRoute: 'Manifesto', keywords: 'manifesto section 3 iii local first security posture nostalgia', desc: 'Where the trust boundary lives' },
  { kind: 'sub', title: 'IV — Confidence costs a checkpoint',          url: '/manifesto', group: 'manifesto', targetRoute: 'Manifesto', keywords: 'manifesto section 4 iv confidence checkpoint gauntlet rule 9 propagation', desc: 'The gauntlet, in prose' },
  { kind: 'sub', title: 'V — Runtime-agnostic by survival',            url: '/manifesto', group: 'manifesto', targetRoute: 'Manifesto', keywords: 'manifesto section 5 v runtime agnostic vendor pivot survival', desc: 'Orchestration outlives the agent that touches it' },
  { kind: 'sub', title: 'VI — Discipline that scales with consequence', url: '/manifesto', group: 'manifesto', targetRoute: 'Manifesto', keywords: 'manifesto section 6 vi discipline tiers consequence governance', desc: 'Same framework holds production and exploration' },
  { kind: 'sub', title: 'VII — Invariants you don\'t argue about',     url: '/manifesto', group: 'manifesto', targetRoute: 'Manifesto', keywords: 'manifesto section 7 vii invariants charter velocity nineteen releases', desc: 'The bet, in one sentence' },

  // ── CHANGELOG RELEASES (sub of Changelog) ────────────────────────
  { kind: 'sub', title: 'v1.3.0 — Coherence realignment + completeness', url: '/changelog#v1-3-0', group: 'release', targetRoute: 'Changelog', keywords: 'v1.3.0 v1 3 0 feature coherence realignment completeness pipelines audit charter', desc: 'Three default pipelines · maddu audit · charter' },
  { kind: 'sub', title: 'v1.2.3 — Entity drawer',                       url: '/changelog#v1-2-3', group: 'release', targetRoute: 'Changelog', keywords: 'v1.2.3 v1 2 3 polish entity drawer plans kanban', desc: 'Click-to-detail drawer primitive' },
  { kind: 'sub', title: 'v1.2.2 — Cockpit path polish',                 url: '/changelog#v1-2-2', group: 'release', targetRoute: 'Changelog', keywords: 'v1.2.2 v1 2 2 polish cockpit path click copy scope pill', desc: 'Rail path display + click-to-copy' },
  { kind: 'sub', title: 'v1.2.1 — Multi-bridge polish',                 url: '/changelog#v1-2-1', group: 'release', targetRoute: 'Changelog', keywords: 'v1.2.1 v1 2 1 polish multi bridge workspace port collision', desc: 'bridges list / kill-all · workspace triage' },
  { kind: 'sub', title: 'v1.2.0 — Supply-chain hardening + Hermes',     url: '/changelog#v1-2-0', group: 'release', targetRoute: 'Changelog', keywords: 'v1.2.0 v1 2 0 hardening supply chain trust mcp secret scan hermes', desc: 'maddu trust · secret scan · Hermes adapter' },
  { kind: 'sub', title: 'v1.1.2 — Narrative refresh',                   url: '/changelog#v1-1-2', group: 'release', targetRoute: 'Changelog', keywords: 'v1.1.2 v1 1 2 patch narrative python detector skill threshold', desc: 'Python detector · skill threshold' },
  { kind: 'sub', title: 'v1.1.1 — Burn-in patch (12 fixes)',            url: '/changelog#v1-1-1', group: 'release', targetRoute: 'Changelog', keywords: 'v1.1.1 v1 1 1 patch burn in windows spawn ralph kanban', desc: 'Windows spawn fix · ralph verify · 10 more' },
  { kind: 'sub', title: 'v1.1.0 — Autonomy + planning + tool gateway',  url: '/changelog#v1-1-0', group: 'release', targetRoute: 'Changelog', keywords: 'v1.1.0 v1 1 0 feature autonomy planning tool gateway coordinator', desc: 'Coordinator as primitive · kanban · loops' },
  { kind: 'sub', title: 'v1.0.5 — Docs sweep',                          url: '/changelog#v1-0-5', group: 'release', targetRoute: 'Changelog', keywords: 'v1.0.5 v1 0 5 patch docs sweep phase markers', desc: 'Phase-X leakage cleared' },
  { kind: 'sub', title: 'v1.0.4 — Generic default lanes',               url: '/changelog#v1-0-4', group: 'release', targetRoute: 'Changelog', keywords: 'v1.0.4 v1 0 4 patch default lanes catalog architecture frontend', desc: '7 generic lanes replace internal ones' },
  { kind: 'sub', title: 'v1.0.3 — Framework-only routes',               url: '/changelog#v1-0-3', group: 'release', targetRoute: 'Changelog', keywords: 'v1.0.3 v1 0 3 patch framework only routes consumer install', desc: 'frameworkOnly route flag' },
  { kind: 'sub', title: 'v1.0.2 — Stage-scroll hotfix',                 url: '/changelog#v1-0-2', group: 'release', targetRoute: 'Changelog', keywords: 'v1.0.2 v1 0 2 patch stage scroll hotfix grid overflow', desc: 'min-height: 0 on stage / stage-body' },
  { kind: 'sub', title: 'v1.0.1 — Cockpit UX patch',                    url: '/changelog#v1-0-1', group: 'release', targetRoute: 'Changelog', keywords: 'v1.0.1 v1 0 1 patch cockpit anchor composer sidenav recent', desc: 'Anchor composer · collapse sidenav' },
  { kind: 'sub', title: 'v1.0.0 — Stable declaration',                  url: '/changelog#v1-0-0', group: 'release', targetRoute: 'Changelog', keywords: 'v1.0.0 v1 0 0 milestone stable declaration public surface', desc: 'Public-surface stability commit' },
  { kind: 'sub', title: 'v0.19.2 — UX polish',                          url: '/changelog#v0-19-2', group: 'release', targetRoute: 'Changelog', keywords: 'v0.19.2 v0 19 2 polish slash output cockpit routes', desc: 'Slash re-print + 6 dedicated routes' },
  { kind: 'sub', title: 'v0.19.1 — Burn-in patch (11 fixes)',           url: '/changelog#v0-19-1', group: 'release', targetRoute: 'Changelog', keywords: 'v0.19.1 v0 19 1 patch burn in slash marker session env import', desc: 'Marker regression · MADDU_SESSION_ID · port-gate' },
  { kind: 'sub', title: 'v0.19.0 — Completeness + hardening',           url: '/changelog#v0-19-0', group: 'release', targetRoute: 'Changelog', keywords: 'v0.19.0 v0 19 0 feature completeness hardening rule 9 permanent stress harness', desc: 'Rule #9 becomes permanent · stress harness' },
  { kind: 'sub', title: 'v0.18.0 — OMC-inspired UX shell',              url: '/changelog#v0-18-0', group: 'release', targetRoute: 'Changelog', keywords: 'v0.18.0 v0 18 0 feature omc slash commands intent routing zero learning curve', desc: '12 slash commands · intent routing' },
  { kind: 'sub', title: 'v0.17.1 — Arc starting point',                 url: '/changelog#v0-17-1', group: 'release', targetRoute: 'Changelog', keywords: 'v0.17.1 v0 17 1 milestone baseline 18 gates starting point', desc: '18 doctor gates · the reference baseline' },

  // ── CONCEPTS (sub of various) ────────────────────────────────────
  { kind: 'sub', title: 'The substrate loop',                  url: '/how-it-works',           group: 'concept', targetRoute: 'How it works',  keywords: 'substrate loop register claim slice stop release close transitions events', desc: '6 transitions · each one event' },
  { kind: 'sub', title: 'The coordinator primitive',           url: '/how-it-works',           group: 'concept', targetRoute: 'How it works',  keywords: 'coordinator primitive multi phase autonomy runtime agnostic', desc: 'Runtime-agnostic autonomous driving' },
  { kind: 'sub', title: 'The slice-stop ritual',               url: '/how-it-works',           group: 'concept', targetRoute: 'How it works',  keywords: 'slice stop ritual hindsight schema action targets gates learnings', desc: '7-field schema · feeds hindsight + approval' },
  { kind: 'sub', title: 'Hindsight skills',                    url: '/architecture#memory',    group: 'concept', targetRoute: 'Architecture',  keywords: 'hindsight skills auto curate threshold cooldown learning persist', desc: 'Auto-curated from slice-stops' },
  { kind: 'sub', title: 'Replay determinism',                  url: '/architecture#spine',     group: 'concept', targetRoute: 'Architecture',  keywords: 'replay determinism past state reconstruct spine projections', desc: 'Past state reconstructible from the spine alone' },
  { kind: 'sub', title: 'The Hermes pattern (forbidden)',      url: '/security',               group: 'concept', targetRoute: 'Security',      keywords: 'hermes pattern forbidden hosted webhook bot tokens inbound', desc: 'Hosted webhook holding many users\' tokens — never built' },
  { kind: 'sub', title: 'No auto-repair',                      url: '/threat-model',           group: 'concept', targetRoute: 'Threat model',  keywords: 'no auto repair spine verify operator decides hide attack', desc: 'Operator reads the failure and decides' },
];
