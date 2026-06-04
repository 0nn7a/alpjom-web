import type {
  RouteLocationNormalizedGeneric,
  RouteLocationRaw
} from 'vue-router';
import { isRoutedPath, toRoutePath } from '@/utils/common.ts';
import {
  DAILY_MODE,
  EASY_DIFFICULTY,
  HARD_DIFFICULTY,
  NORMAL_DIFFICULTY,
  normalizeWordleDifficulty,
  normalizeWordleMode,
  PRACTICE_MODE
} from '@/utils/wordle.ts';

export const ROUTE_NAME_WORDLE_GAME = 'wordle-game';
export const ROUTE_PATH_WORDLE_GAME = `:mode(${DAILY_MODE.toLowerCase()}|${PRACTICE_MODE.toLowerCase()})/:difficulty(${EASY_DIFFICULTY.toLowerCase()}|${NORMAL_DIFFICULTY.toLowerCase()}|${HARD_DIFFICULTY.toLowerCase()})`;

export function getWordleGameRedirectRoute(
  to: RouteLocationNormalizedGeneric
): RouteLocationRaw | null {
  if (to.name !== ROUTE_NAME_WORDLE_GAME) return null;

  const mode = to.params.mode;
  const difficulty = to.params.difficulty;

  const normalizedMode = normalizeWordleMode(mode);
  const normalizedDifficulty = normalizeWordleDifficulty(difficulty);

  const nextMode = toRoutePath(mode);
  let nextDifficulty = toRoutePath(difficulty);

  // DAILY 模式僅提供 NORMAL 模式
  if (
    normalizedMode === DAILY_MODE &&
    normalizedDifficulty !== NORMAL_DIFFICULTY
  ) {
    nextDifficulty = toRoutePath(NORMAL_DIFFICULTY);
  }

  // 確認屬於規範路由（不需要重定向的條件），避免無限迴圈：
  // 模式與難度本來就全是小寫，且和判斷後應該去的目的地一致
  const isCanonicalRoute =
    isRoutedPath(mode) &&
    isRoutedPath(difficulty) &&
    nextMode === mode &&
    nextDifficulty === difficulty;
  if (isCanonicalRoute) return null;

  return {
    name: ROUTE_NAME_WORDLE_GAME,
    replace: true,
    params: { mode: nextMode, difficulty: nextDifficulty }
  };
}
