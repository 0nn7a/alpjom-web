import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { WordleGuess, LetterResult } from '@/types/wordle.ts';
import type { WordleDifficulty, WordleMode } from '@/utils/wordle.ts';
import { ApiError } from '@/types/common.ts';
import { useToastStore } from '@/stores/toast.ts';
import { wordleService } from '@/services/wordle.ts';
import { toTaiwanDateStr } from '@/utils/common.ts';

export const useWordleStore = defineStore('wordle', () => {
  // States
  const toastStore = useToastStore();

  // 用於更新鍵盤狀態：
  // G / Y 的優先序高於 W，避免同一個字母在後續猜中被修正後仍顯示為錯誤鍵
  const priority: Record<LetterResult, number> = { G: 3, Y: 2, W: 1 };

  const gameId = ref<number | null>(null);
  const mode = ref<WordleMode | null>(null);
  const difficulty = ref<WordleDifficulty | null>(null);
  const maxGuesses = ref<number | null>(null);
  const isWin = ref<boolean | null>(null);
  const date = ref<string | null>(null);
  const answer = ref<string | null>(null);
  const shareToken = ref<string | null>(null);
  const guesses = ref<WordleGuess[]>([]);

  // Getters
  const isGameOver = computed(
    () =>
      isWin.value !== null ||
      (maxGuesses.value && maxGuesses.value === guesses.value.length)
  );
  const remainder = computed(() => {
    if (!maxGuesses.value) return '∞';
    return maxGuesses.value - guesses.value.length;
  });
  const keyDecorations = computed(() => {
    const letterState = new Map<string, LetterResult>();

    guesses.value.forEach((guess) => {
      [...guess.result].forEach((r, idx) => {
        const letter = guess.guessWord[idx].toUpperCase();
        const prev = letterState.get(letter);
        const curr = r as LetterResult;

        // 當前結果的優先序 > 已記錄的優先序（或尚未記錄）時，才更新：
        // prev 是 undefined → 0，任何結果都會寫入
        // prev 是 'W' → 1，Y 或 G 可以覆蓋它
        // prev 是 'Y' → 2，只有 G 可以覆蓋
        // prev 是 'G' → 3，沒有任何東西可以覆蓋
        if (priority[curr] > (priority[prev!] ?? 0)) {
          letterState.set(letter, curr);
        }
      });
    });

    const wrongKeys = new Set(
      [...letterState.entries()]
        .filter(([, state]) => state === 'W')
        .map(([letter]) => letter)
    );

    return wrongKeys.size ? [{ keys: wrongKeys, className: 'dimmed' }] : [];
  });

  // Actions
  function checkData() {
    console.log('gameId: ', gameId.value);
    console.log('mode: ', mode.value);
    console.log('difficulty: ', difficulty.value);
    console.log('maxGuesses: ', maxGuesses.value);
    console.log('isWin: ', isWin.value);
    console.log('date: ', date.value);
    console.log('answer: ', answer.value);
    console.log('shareToken: ', shareToken.value);
    console.log('guesses: ', guesses.value);
  }

  async function start(date: string = toTaiwanDateStr(new Date())) {
    try {
      if (!mode.value || !difficulty.value) return;

      const { data } = await wordleService.start({
        mode: mode.value,
        difficulty: difficulty.value,
        date
      });
      gameId.value = data.gameId;
      maxGuesses.value = data.maxGuesses;
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
    }
  }

  async function guess(guessWord: string) {
    try {
      if (!gameId.value) return;

      const { data } = await wordleService.guess({
        gameId: gameId.value,
        guessWord
      });
      isWin.value = data.isWin;
      answer.value = data.answer;
      shareToken.value = data.shareToken;
      guesses.value.push(data.guess);

      checkData();
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
      throw err;
    }
  }

  async function game() {
    try {
      if (!gameId.value) return;

      const { data } = await wordleService.game(gameId.value);
      gameId.value = data.gameId;
      mode.value = data.mode;
      difficulty.value = data.difficulty;
      maxGuesses.value = data.maxGuesses;
      isWin.value = data.isWin;
      date.value = data.date;
      answer.value = data.answer;
      guesses.value = data.guesses;
      shareToken.value = data.shareToken;

      checkData();
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
      throw err;
    }
  }

  async function share(shareToken: string) {
    try {
      const { data } = await wordleService.share(shareToken);
      return data;
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
      throw err;
    }
  }

  async function toggleLike(shareToken: string) {
    try {
      const { data } = await wordleService.toggleLike(shareToken);
      return data;
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
      throw err;
    }
  }

  async function insertComment(shareToken: string, content: string) {
    try {
      await wordleService.insertComment({ shareToken, content });
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
      throw err;
    }
  }

  async function deleteComment(id: number) {
    try {
      await wordleService.deleteComment(id);
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
      throw err;
    }
  }

  async function beforeDaily(date: string = toTaiwanDateStr(new Date())) {
    try {
      const { data } = await wordleService.beforeDaily(date);
      gameId.value = data.gameId;
      isWin.value = data.isWin;
      shareToken.value = data.shareToken;
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
    }
  }

  async function beforePractice(difficulty: WordleDifficulty) {
    try {
      const { data } = await wordleService.beforePractice(difficulty);
      return data;
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
      throw err;
    }
  }

  function reset() {
    gameId.value = null;
    mode.value = null;
    difficulty.value = null;
    maxGuesses.value = null;
    isWin.value = null;
    date.value = null;
    answer.value = null;
    shareToken.value = null;
    guesses.value = [];

    checkData();
  }

  return {
    gameId,
    mode,
    difficulty,
    maxGuesses,
    isWin,
    date,
    answer,
    shareToken,
    guesses,
    isGameOver,
    remainder,
    keyDecorations,
    start,
    guess,
    game,
    share,
    toggleLike,
    insertComment,
    deleteComment,
    beforeDaily,
    beforePractice,
    reset
  };
});
