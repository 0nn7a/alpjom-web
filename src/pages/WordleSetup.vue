<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import DiaLog from '@/components/DiaLog.vue';
import DateBar from '@/components/DateBar.vue';
import {
  CheckBadgeIcon,
  TrophyIcon,
  LockClosedIcon
} from '@heroicons/vue/24/outline';
import { type Component, computed, onBeforeUnmount, ref, watch } from 'vue';
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
import { toTaiwanDateStr } from '@/utils/common.ts';

const router = useRouter();
const wordleStore = useWordleStore();

// DateBar
const selectedDate = ref(new Date());
const selectedDateStr = computed(() => toTaiwanDateStr(selectedDate.value));
const selectedDateParts = computed(() => {
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone: 'Asia/Taipei'
  }).formatToParts(selectedDate.value);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';

  return {
    year: get('year'),
    day: `${get('month')} ${get('day')}`,
    weekday: get('weekday')
  };
});
watch(selectedDate, async () => {
  await wordleStore.beforeDaily(selectedDateStr.value);
});

// 遊戲配置選項
type Config = {
  label: string;
  description: string;
  icon?: Component;
  mode: WordleMode;
  difficulty: WordleDifficulty;
};

// 每日模式：已完成｜未完成（二擇一顯示）
const dailyOptions = {
  completed: {
    label: 'Completed',
    description: 'To share page',
    icon: CheckBadgeIcon,
    mode: DAILY_MODE,
    difficulty: NORMAL_DIFFICULTY
  },
  notYet: {
    label: 'Not yet',
    description: 'To play today game',
    icon: LockClosedIcon,
    mode: DAILY_MODE,
    difficulty: NORMAL_DIFFICULTY
  }
} satisfies Record<string, Config>;
const dailyConfig = computed(() =>
  wordleStore.shareToken ? dailyOptions.completed : dailyOptions.notYet
);

// 練習模式：三種難度（全顯示）
const practiceConfigs: Config[] = [
  {
    label: EASY_DIFFICULTY,
    description: '無限制',
    mode: PRACTICE_MODE,
    difficulty: EASY_DIFFICULTY
  },
  {
    label: NORMAL_DIFFICULTY,
    description: '6次機會',
    mode: PRACTICE_MODE,
    difficulty: NORMAL_DIFFICULTY
  },
  {
    label: HARD_DIFFICULTY,
    description: '3次機會',
    mode: PRACTICE_MODE,
    difficulty: HARD_DIFFICULTY
  }
] as const;

const config = ref<Config>(dailyConfig.value);

// 練習模式：已存在遊戲清單
const gameList = ref<WordleOngoing[]>([]);
const selectedGameId = ref<number | null>(null);
const isSelectedGame = computed(() => selectedGameId.value !== null);

// 彈窗二次確認畫面
type DialogType =
  | 'dailyShare'
  | 'dailyContinue'
  | 'practiceNew'
  | 'practiceContinue';
const dialogType = ref<DialogType | null>(null);

const dialogDes = computed(
  () => `${config.value.mode} 模式 + ${config.value.difficulty} 難度`
);
const dialogShow = ref(false);
watch(dialogShow, (val) => {
  if (!val) {
    gameList.value = [];
    selectedGameId.value = null;
    dialogType.value = null;
  }
});

// 開啟彈窗
const next = async () => {
  try {
    if (config.value.mode === DAILY_MODE) {
      dialogType.value = wordleStore.shareToken
        ? 'dailyShare'
        : 'dailyContinue';
    } else {
      const list = await wordleStore.beforePractice(config.value.difficulty);
      if (list.length <= 0) {
        dialogType.value = 'practiceNew';
      } else {
        gameList.value = list;
        dialogType.value = 'practiceContinue';
      }
    }
    dialogShow.value = true;
  } catch (err) {}
};

// 操作彈窗
const confirm = async (close: () => void) => {
  close();

  // 每日謎題已完成，是否導向分享頁
  if (dialogType.value === 'dailyShare') {
    return router.push({
      name: 'wordle-share',
      params: { shareToken: wordleStore.shareToken }
    });
  }
  // 繼續進行選中的練習謎題
  else if (
    dialogType.value === 'practiceContinue' &&
    selectedGameId.value !== null
  ) {
    wordleStore.gameId = selectedGameId.value;
  }
  // 其他：新練習謎題、新每日謎題、繼續每日謎題
  else {
    wordleStore.mode = config.value.mode;
    wordleStore.difficulty = config.value.difficulty;
    await wordleStore.start(selectedDateStr.value);
  }

  await router.push({
    name: 'wordle-game',
    params: { gameId: wordleStore.gameId }
  });
};

onBeforeUnmount(() => {
  wordleStore.reset();
});
</script>

<template>
  <DefaultLayout>
    <section class="w-full flex flex-col items-center py-3">
      <!-- 選中日期 -->
      <p class="text-2xl text-(--aj-color-subtle) leading-0 opacity-30">
        {{ selectedDateParts.weekday }}
      </p>
      <p class="font-semibold text-4xl">{{ selectedDateParts.day }}</p>
      <p class="text-(--aj-color-subtle)">
        {{ selectedDateParts.year }}
      </p>

      <!-- 中間主要滾動區 -->
      <div
        class="my-auto w-full pt-6 flex flex-col items-center overflow-y-auto"
      >
        <!-- 每日模式卡片（二擇一）：已完成｜未完成-->
        <label
          for="wordle-daily"
          :class="
            wordleStore.shareToken
              ? 'card--daily-completed'
              : 'card--daily-uncompleted'
          "
        >
          <span class="self-end flex items-center gap-0.5">
            <Component :is="dailyConfig.icon" class="h-4.5 aspect-square" />
            <span class="leading-none text-xl">{{ dailyConfig.label }}</span>
          </span>
          <span class="self-end text-xs opacity-40">
            {{ dailyConfig.description }} →
          </span>

          <span class="mt-auto">Wordle</span>
          <span class="leading-none text-xs opacity-40"> DAILY | NORMAL </span>

          <span
            v-if="wordleStore.isWin"
            class="absolute right-4 bottom-4 flex flex-col text-(--aj-color-subtle)"
          >
            <span class="text-xs scale-85">WIN</span>
            <TrophyIcon class="h-6 stroke-1 aspect-square" />
          </span>
        </label>
        <input
          type="radio"
          name="wordle config"
          id="wordle-daily"
          :value="dailyConfig"
          v-model="config"
          class="hidden"
        />

        <!-- 練習模式卡片：三種難度 -->
        <div
          class="shrink-0 h-24 grid grid-cols-3 mt-3 px-6 gap-2 overflow-y-hidden"
        >
          <template v-for="option in practiceConfigs" :key="option.label">
            <label :for="'wordle-practice-' + option.label" class="item-box">
              <span>{{ option.label }}</span>
              <small class="text-xs opacity-50">{{ option.description }}</small>
            </label>
            <input
              type="radio"
              name="wordle config"
              :id="'wordle-practice-' + option.label"
              :value="option"
              v-model="config"
              class="hidden"
            />
          </template>
        </div>
      </div>

      <button type="button" class="mt-6 btn-primary" @click="next">Next</button>
    </section>

    <!-- 日期選擇器 -->
    <template #footer>
      <DateBar v-model="selectedDate" />
    </template>
  </DefaultLayout>

  <DiaLog v-model="dialogShow" title="提示" :description="dialogDes">
    <!-- DAILY 謎題已完成 -->
    <p v-if="dialogType === 'dailyShare'">
      當日謎題已完成，無法二次挑戰，是否跳轉至結果分享頁？
    </p>

    <!-- DAILY 謎題新建或繼續 -->
    <p v-else-if="dialogType === 'dailyContinue'">
      每日僅能挑戰一次 DAILY 謎題，若已有進行中的當日謎題，將自動繼續該局遊戲。
    </p>

    <!-- PRACTICE 謎題新建 -->
    <p v-else-if="dialogType === 'practiceNew'">
      即將新開啟一局難度為 {{ config.difficulty }} 的隨機
      {{ config.mode }} 謎題。
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
      <template v-if="dialogType === 'practiceContinue'">
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
          :class="!isSelectedGame ? ['btn-disabled'] : 'btn-success'"
          :disabled="!isSelectedGame"
          @click="confirm(close)"
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

@utility card-basic {
  @apply shrink-0 p-4 w-60 h-36 relative flex flex-col items-start border border-(--aj-color-border) rounded-lg cursor-pointer overflow-hidden select-none transition-all duration-300 ease-in-out;

  &:has(+ input[type='radio']:checked) {
    @apply border-(--aj-color-border-active) shadow-[0_0_0.5rem_var(--aj-color-border)] animate-[pulse-scale_3s_infinite];
  }
}
.card--daily-completed {
  @apply card-basic text-(--aj-color-text) bg-radial-[at_50%_75%] via-(--aj-color-bg) to-(--aj-color-surface-hover);
}
.card--daily-uncompleted {
  @apply card-basic text-(--aj-color-muted) border-dashed;

  &:has(+ input[type='radio']:checked) {
    @apply text-(--aj-color-text);
  }
}

.item-box {
  @apply -mx-2.5 h-full py-4 px-3 flex flex-col text-center text-(--aj-color-muted) bg-(--aj-color-bg) border border-(--aj-color-border)/70 shadow-md rounded cursor-pointer select-none transition-all duration-300;

  &:has(+ input[type='radio']:checked) {
    @apply z-10 font-semibold text-(--aj-color-text) bg-(--aj-color-surface) border-(--aj-color-border-active) shadow-[0_0_0.5rem_var(--aj-color-border)] translate-y-3 animate-[pulse-scale_3s_infinite];
  }
}
.item-box:nth-of-type(1) {
  @apply z-2 -rotate-6 translate-y-6;
}
.item-box:nth-of-type(2) {
  @apply z-1 rotate-0 translate-y-4;
}
.item-box:nth-of-type(3) {
  @apply z-0 rotate-6 translate-y-6;
}

.game-item {
  @apply w-full flex flex-col py-4 px-2 text-center text-(--aj-color-muted) border border-(--aj-color-surface-hover) ring-(--aj-color-ring) rounded cursor-pointer transition-all duration-300 hover:bg-(--aj-color-surface) peer-checked:text-(--aj-color-text) peer-checked:border-(--aj-color-border-active) peer-checked:ring-2;
}
.dialog-btn {
  @apply py-1.5 px-2 text-sm;
}
</style>
