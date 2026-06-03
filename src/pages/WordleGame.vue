<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, onMounted } from 'vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import KeyBoard from '@/components/KeyBoard.vue';
import { useToastStore } from '@/stores/toast.ts';
import {
  normalizeWordleDifficulty,
  normalizeWordleMode
} from '@/utils/wordle.ts';

const route = useRoute();
const toastStore = useToastStore();
const mode = computed(() => normalizeWordleMode(route.params.mode));
const difficulty = computed(() =>
  normalizeWordleDifficulty(route.params.difficulty)
);

const guesses = [
  {
    guessWord: 'ocean',
    result: 'WWYYW'
  },
  {
    guessWord: 'early',
    result: 'YGWYW'
  },
  {
    guessWord: 'leads',
    result: 'YYYWW'
  }
];
const toneClasses: Record<string, string> = {
  G: 'wordle-g',
  Y: 'wordle-y',
  W: 'wordle-w'
};

const handleKeyPress = (key: string) => {
  toastStore.notify(`當前點擊：${key}`, { duration: 1000 });
};

onMounted(async () => {
  console.log({ mode: mode.value, difficulty: difficulty.value });
});
</script>

<template>
  <DefaultLayout>
    <section
      class="w-full flex flex-col items-center pointer-events-none select-none"
    >
      <ul class="flex flex-col gap-y-2">
        <li
          v-for="(item, index) in guesses"
          :key="item.guessWord"
          class="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center"
        >
          <span
            class="me-2 px-0.5 min-w-[2ch] text-xs text-center text-(--aj-color-subtle) bg-(--aj-color-surface) rounded"
          >
            {{ index + 1 }}
          </span>
          <p
            v-for="(word, idx) in item.guessWord"
            :key="item.guessWord + idx"
            class="wordle-item w-[1.5ch] text-xl text-center"
            :class="toneClasses[item.result[idx]]"
          >
            {{ word.toUpperCase() }}
          </p>
        </li>
      </ul>
    </section>

    <template #footer>
      <KeyBoard @press="handleKeyPress" />
    </template>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.wordle-item {
  position: relative;
  color: var(--wordle-text);
  &:before {
    content: '';
    position: absolute;
    top: 5%;
    left: 50%;
    height: 0.16rem;
    aspect-ratio: 1 / 1;
    background-color: var(--wordle-dot);
    border-radius: 100%;
    transform: translateX(-50%);
  }
}
.wordle-g {
  --wordle-text: var(--aj-tone-success-text);
  --wordle-dot: var(--aj-tone-success-text);
}
.wordle-y {
  --wordle-text: var(--aj-tone-warning-text);
  --wordle-dot: var(--aj-tone-warning-text);
}
.wordle-w {
  --wordle-text: var(--aj-color-subtle);
  --wordle-dot: transparent;
}
</style>
