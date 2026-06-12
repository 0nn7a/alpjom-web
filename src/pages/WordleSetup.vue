<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import DiaLog from '@/components/DiaLog.vue';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useWordleStore } from '@/stores/wordle.ts';
import {
  DAILY_MODE,
  PRACTICE_MODE,
  EASY_DIFFICULTY,
  HARD_DIFFICULTY,
  NORMAL_DIFFICULTY,
  type WordleDifficulty,
  type WordleMode
} from '@/utils/wordle.ts';
import type { WordleOngoing } from '@/types/wordle.ts';

const router = useRouter();
const wordleStore = useWordleStore();

const modeOptions = [
  {
    id: `wordle-mode-${DAILY_MODE}`,
    value: DAILY_MODE,
    label: DAILY_MODE,
    description: '每日謎題'
  },
  {
    id: `wordle-mode-${PRACTICE_MODE}`,
    value: PRACTICE_MODE,
    label: PRACTICE_MODE,
    description: '練習'
  }
] as const;

const difficultyOptions = [
  {
    id: `wordle-difficulty-${EASY_DIFFICULTY}`,
    value: EASY_DIFFICULTY,
    label: EASY_DIFFICULTY,
    description: '無限制'
  },
  {
    id: `wordle-difficulty-${NORMAL_DIFFICULTY}`,
    value: NORMAL_DIFFICULTY,
    label: NORMAL_DIFFICULTY,
    description: '6次機會'
  },
  {
    id: `wordle-difficulty-${HARD_DIFFICULTY}`,
    value: HARD_DIFFICULTY,
    label: HARD_DIFFICULTY,
    description: '3次機會'
  }
] as const;

const mode = ref<WordleMode>(DAILY_MODE);
const difficulty = ref<WordleDifficulty>(NORMAL_DIFFICULTY);
const isDifficultyLocked = computed(() => mode.value === DAILY_MODE);
watch(mode, (nextMode) => {
  if (nextMode === DAILY_MODE) difficulty.value = NORMAL_DIFFICULTY;
});

const selectedGameId = ref<number | null>(null);
const isSelected = computed(() => selectedGameId.value !== null);

const gameList = ref<WordleOngoing[]>([]);

type DialogType =
  | 'dailyContinue'
  | 'dailyShare'
  | 'practiceNew'
  | 'practiceContinue'
  | null;
const dialogType = ref<DialogType>(null);

const dialogShow = ref(false);
const dialogDes = computed(
  () => `${mode.value} 模式 + ${difficulty.value} 難度`
);
const isDialogType = computed(() => ({
  dailyContinue: dialogType.value === 'dailyContinue',
  dailyShare: dialogType.value === 'dailyShare',
  practiceNew: dialogType.value === 'practiceNew',
  practiceContinue: dialogType.value === 'practiceContinue'
}));

watch(dialogShow, (val) => {
  if (!val) {
    selectedGameId.value = null;
    gameList.value = [];
    dialogType.value = null;
  }
});

const startGame = async () => {
  try {
    switch (mode.value) {
      case DAILY_MODE:
        const { gameId, isWin, shareToken } = await wordleStore.beforeDaily();
        if (gameId !== null && isWin !== null) {
          dialogType.value = 'dailyShare';
          wordleStore.shareToken = shareToken;
        } else {
          dialogType.value = 'dailyContinue';
        }
        break;
      case PRACTICE_MODE:
        const list = await wordleStore.beforePractice(difficulty.value);
        if (list.length <= 0) {
          dialogType.value = 'practiceNew';
        } else {
          gameList.value = list;
          dialogType.value = 'practiceContinue';
        }
        break;
    }
    dialogShow.value = true;
  } catch (err) {}
};

const confirm = async (
  close: () => void,
  isPracticeContinue: boolean = false
) => {
  close();

  // 每日謎題已完成，是否導向分享頁
  if (isDialogType.value.dailyShare) {
    return router.push({
      name: 'wordle-share',
      params: { shareToken: wordleStore.shareToken }
    });
  }
  // 繼續進行選中的練習謎題
  else if (isDialogType.value.practiceContinue && isPracticeContinue) {
    wordleStore.gameId = selectedGameId.value;
  }
  // 其他：新練習謎題、新每日謎題、繼續每日謎題
  else {
    wordleStore.mode = mode.value;
    wordleStore.difficulty = difficulty.value;
    await wordleStore.start();
  }

  await router.push({
    name: 'wordle-game',
    params: { gameId: wordleStore.gameId }
  });
};
</script>

<template>
  <DefaultLayout>
    <section class="m-auto flex flex-col items-center text-(--aj-color-text)">
      <p class="text-2xl text-(--aj-color-subtle) leading-0 opacity-20">Mode</p>
      <p class="text-lg">模式</p>

      <div class="mt-3 grid grid-cols-2 gap-2">
        <template v-for="option in modeOptions" :key="option.id">
          <label :for="option.id" class="item-box">
            <span>{{ option.label }}</span>
            <small class="text-xs opacity-50">{{ option.description }}</small>
          </label>
          <input
            type="radio"
            name="wordle-mode"
            :id="option.id"
            :value="option.value"
            v-model="mode"
            class="hidden"
          />
        </template>
      </div>

      <p class="mt-3 mb-14 text-xs text-(--aj-color-subtle)">
        *每日謎題(DAILY)模式僅提供經典難度(NORMAL)
      </p>

      <p class="text-2xl text-(--aj-color-subtle) leading-0 opacity-20">
        Difficulty
      </p>
      <p class="text-lg">難易度</p>

      <div class="mt-3 mb-10 grid grid-cols-3 gap-2">
        <template v-for="option in difficultyOptions" :key="option.id">
          <label
            :for="option.id"
            class="item-box"
            :class="{ disabled: isDifficultyLocked }"
          >
            <span>{{ option.label }}</span>
            <small class="text-xs opacity-50">{{ option.description }}</small>
          </label>
          <input
            type="radio"
            name="wordle-difficulty"
            :id="option.id"
            :value="option.value"
            v-model="difficulty"
            :disabled="isDifficultyLocked"
            class="hidden"
          />
        </template>
      </div>

      <button type="button" class="mt-6 btn-primary" @click="startGame">
        Start!
      </button>
    </section>
  </DefaultLayout>

  <DiaLog v-model="dialogShow" title="提示" :description="dialogDes">
    <!-- DAILY 謎題已完成 -->
    <p v-if="isDialogType.dailyShare">
      當日謎題已完成，無法二次挑戰，是否跳轉至結果分享頁？
    </p>

    <!-- DAILY 謎題新建或繼續 -->
    <p v-else-if="isDialogType.dailyContinue">
      每日僅能挑戰一次 DAILY 謎題，若已有進行中的當日謎題，將自動繼續該局遊戲。
    </p>

    <!-- PRACTICE 謎題新建 -->
    <p v-else-if="isDialogType.practiceNew">
      即將新開啟一局難度為 {{ difficulty }} 的隨機 {{ mode }} 謎題。
    </p>

    <!-- PRACTICE 謎題新建或繼續 -->
    <div v-else class="flex flex-col gap-2">
      <p>已有相同模式及難度的遊戲尚未完成，可選擇繼續或另開新遊戲：</p>
      <div class="grid grid-cols-2 gap-2 select-none">
        <div v-for="game in gameList" :key="game.createdAt">
          <input
            type="radio"
            name="continueGames"
            :id="`continue${game.gameId}`"
            :value="game.gameId"
            v-model="selectedGameId"
            class="peer hidden"
          />
          <label :for="`continue${game.gameId}`" class="game-item">
            <span class="block text-xs text-(--aj-color-subtle)">
              已猜 / 總次數
            </span>
            <span class="block text-xl">
              <strong class="font-semibold text-4xl">
                {{ game.currentGuesses }}
              </strong>
              / {{ game.maxGuesses ? game.maxGuesses : '∞' }}
            </span>
            <span class="mt-2 mb-1 block text-xs text-(--aj-color-subtle)">
              開始時間
            </span>
            <span class="block leading-4 text-sm">
              {{ game.createdAt.split('T')[0] }}
            </span>
            <span class="block leading-4 text-sm">
              {{ game.createdAt.split('T')[1] }}
            </span>
          </label>
        </div>
      </div>
    </div>

    <template #footer="{ close }">
      <template v-if="isDialogType.practiceContinue">
        <button
          type="button"
          class="btn-danger dialog-btn"
          @click="confirm(close)"
        >
          新遊戲
        </button>
        <button
          type="button"
          class="dialog-btn"
          :class="!isSelected ? ['btn-disabled'] : 'btn-success'"
          :disabled="!isSelected"
          @click="confirm(close, true)"
        >
          繼續遊戲
        </button>
      </template>

      <button
        v-else
        type="button"
        class="btn-primary dialog-btn"
        @click="confirm(close)"
      >
        確認
      </button>
    </template>
  </DiaLog>
</template>

<style scoped>
@reference '@/assets/styles/style';

.item-box {
  @apply py-5 px-3.5 flex flex-col text-center text-(--aj-color-muted) bg-(--aj-color-surface) border border-transparent ring-2 ring-transparent rounded cursor-pointer select-none transition-all duration-300;
}
.item-box:not(.disabled):hover {
  @apply border-(--aj-color-border);
}
.item-box:has(+ input[type='radio']:checked) {
  @apply text-(--aj-color-text) bg-(--aj-color-bg) border-(--aj-color-border-active) ring-(--aj-color-ring);
}
.item-box.disabled {
  @apply text-(--aj-color-subtle) bg-(--aj-color-surface-hover) cursor-not-allowed;
}

.game-item {
  @apply w-full flex flex-col py-4 px-2 text-center text-(--aj-color-muted) border border-(--aj-color-surface-hover) ring-(--aj-color-ring) rounded cursor-pointer transition-all duration-300 hover:bg-(--aj-color-surface) peer-checked:text-(--aj-color-text) peer-checked:border-(--aj-color-border-active) peer-checked:ring-2;
}
.dialog-btn {
  @apply py-1.5 px-2 text-sm;
}
</style>
