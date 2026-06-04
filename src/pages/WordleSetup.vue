<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToastStore } from '@/stores/toast.ts';
import {
  DAILY_MODE,
  EASY_DIFFICULTY,
  HARD_DIFFICULTY,
  NORMAL_DIFFICULTY,
  PRACTICE_MODE,
  type WordleDifficulty,
  type WordleMode
} from '@/utils/wordle.ts';

const router = useRouter();
const toastStore = useToastStore();

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

const startGame = () => {
  if (mode.value === PRACTICE_MODE) {
    toastStore.notify('該模式開發中，敬請期待！', { tone: 'warning' });
    return;
  }

  router.push({
    name: 'wordle-game',
    params: { mode: mode.value, difficulty: difficulty.value }
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
</template>

<style scoped>
@reference '@/assets/styles/style.css';

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
</style>
