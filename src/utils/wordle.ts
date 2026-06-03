export const WORDLE_MODES = ['daily', 'practice'] as const;
export type WordleMode = (typeof WORDLE_MODES)[number];

export const WORDLE_DIFFICULTIES = ['easy', 'normal', 'hard'] as const;
export type WordleDifficulty = (typeof WORDLE_DIFFICULTIES)[number];

function isWordleMode(value: string): value is WordleMode {
  return WORDLE_MODES.includes(value as WordleMode);
}

function isWordleDifficulty(value: string): value is WordleDifficulty {
  return WORDLE_DIFFICULTIES.includes(value as WordleDifficulty);
}

export function normalizeWordleMode(value: unknown): WordleMode | null {
  if (typeof value !== 'string') return null;

  const normalized = value.toLowerCase();
  return isWordleMode(normalized) ? normalized : null;
}

export function normalizeWordleDifficulty(value: unknown): WordleDifficulty | null {
  if (typeof value !== 'string') return null;

  const normalized = value.toLowerCase();
  return isWordleDifficulty(normalized) ? normalized : null;
}
