// capability-matrix.ts — the 15-axis capability matrix behind /compare.
// Cell marks derive from the merged July-2026 competitive research matrix;
// where the two source reports disagreed, the conservative (shipped-surface)
// mark wins. 'u' = not publicly scored — rendered as an explicit unknown,
// never guessed. Order of the marks string follows AXES below.
//
//   y = full support · p = partial/conditional · n = absent · u = not scored

export const AXES = [
  'Multi-agent coordination',
  'Approvals workflow',
  'Deterministic gates / CI',
  'Tamper-detecting audit record',
  'Vendor / runtime-agnostic',
  'Local-first (no cloud)',
  'Web UI / cockpit',
  'Multi-repo / workspace',
  'Learning / memory layer',
  'Cost tracking / budgets',
  'Autonomy / trust scoring',
  'Enterprise identity / SSO',
  'Team / multi-user',
  'Hosted / managed option',
  'Ecosystem / community size',
] as const;

export type Mark = 'y' | 'p' | 'n' | 'u';

export interface Player {
  label: string;
  marks: string; // one char per axis, in AXES order
}

export const MADDU: Player = { label: 'Máddu', marks: 'yyyyyyyyyyynnnn' };

export const PLAYERS: Record<string, Player> = {
  'claude-code':     { label: 'Claude Code',      marks: 'pypnnyppypnypyy' },
  'codex-cli':       { label: 'Codex CLI',        marks: 'pypnnyppnpnppyy' },
  'paperclip':       { label: 'Paperclip',        marks: 'yyuuyuyuuyuuuuy' },
  'ruflo':           { label: 'Ruflo',            marks: 'punpppuyyppnyny' },
  'vibe-kanban':     { label: 'Vibe Kanban',      marks: 'ppnpypyynnnnypy' },
  'claude-squad':    { label: 'Claude Squad',     marks: 'ppnnyynpnnnnnnp' },
  'omc':             { label: 'oh-my-claudecode', marks: 'pppnpynpnpnnpny' },
  'kodo':            { label: 'kodo',             marks: 'pnppyypnnnnnnnn' },
  'github-agent-hq': { label: 'GitHub Agent HQ',  marks: 'pypppnyynynyyyy' },
  'coder':           { label: 'Coder',            marks: 'ppnpynyyyynyynp' },
  'microsoft-agt':   { label: 'Microsoft AGT',    marks: 'nyppypnnnpyyynp' },
  'langgraph':       { label: 'LangGraph',        marks: 'yynyyynnpnnyyyy' },
  'letta':           { label: 'Letta',            marks: 'ynnyyyyyynnpyyp' },
  'temporal':        { label: 'Temporal',         marks: 'yynyypyynynyyyy' },
  'langfuse':        { label: 'Langfuse',         marks: 'nnpyyyyynynyyyy' },
  'aider':           { label: 'Aider',            marks: 'npppyynnnpnnnny' },
};

/** The hub's "one for all" column set — the ten most-compared systems. */
export const HUB_PLAYERS = [
  'claude-code',
  'codex-cli',
  'paperclip',
  'vibe-kanban',
  'github-agent-hq',
  'microsoft-agt',
  'langgraph',
  'letta',
  'temporal',
  'langfuse',
];
