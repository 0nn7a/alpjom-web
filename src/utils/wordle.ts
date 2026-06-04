export const WORDLE_MODES = ['DAILY', 'PRACTICE'] as const;
export type WordleMode = (typeof WORDLE_MODES)[number];
export const [DAILY_MODE, PRACTICE_MODE] = WORDLE_MODES;

export const WORDLE_DIFFICULTIES = ['EASY', 'NORMAL', 'HARD'] as const;
export type WordleDifficulty = (typeof WORDLE_DIFFICULTIES)[number];
export const [EASY_DIFFICULTY, NORMAL_DIFFICULTY, HARD_DIFFICULTY] =
  WORDLE_DIFFICULTIES;

function isWordleMode(value: string): value is WordleMode {
  return WORDLE_MODES.includes(value as WordleMode);
}

function isWordleDifficulty(value: string): value is WordleDifficulty {
  return WORDLE_DIFFICULTIES.includes(value as WordleDifficulty);
}

export function normalizeWordleMode(value: string | string[]): WordleMode {
  const normalized = (value as string).toUpperCase();
  if (isWordleMode(normalized)) return normalized;
  throw new Error(`Invalid WordleMode: ${value}`);
}

export function normalizeWordleDifficulty(
  value: string | string[]
): WordleDifficulty {
  const normalized = (value as string).toUpperCase();
  if (isWordleDifficulty(normalized)) return normalized;
  throw new Error(`Invalid WordleDifficulty: ${value}`);
}
