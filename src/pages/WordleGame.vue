<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from 'vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import KeyBoard from '@/components/KeyBoard.vue';
import { useToastStore } from '@/stores/toast.ts';
import { useWordleStore } from '@/stores/wordle.ts';
import { toTaiwanDateParts } from '@/utils/common.ts';

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();
const wordleStore = useWordleStore();

const toneClasses: Record<string, string> = {
  G: 'wordle-g',
  Y: 'wordle-y',
  W: 'wordle-w'
};

const dateParts = computed(() => toTaiwanDateParts(wordleStore.date));

const scrollDom = ref<HTMLElement | null>(null);
async function scrollToBottom() {
  await nextTick(); // 等 DOM 更新完，新內容算進 scrollHeight
  const el = scrollDom.value;
  if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
}
watch(
  () => wordleStore.guesses.length,
  async () => {
    console.log('guesses changed');
    await scrollToBottom();
  }
);

const inputted = ref('');
const handleKeyPress = async (key: string) => {
  if (wordleStore.isGameOver) {
    toastStore.notify('此局已完成，無法繼續猜題！', { tone: 'warning' });
    return;
  }

  switch (key) {
    case 'Enter':
      if (inputted.value.length < 5) {
        toastStore.notify('請輸入一個 5 字英文單詞！', { tone: 'warning' });
        return;
      }

      try {
        await wordleStore.guess(inputted.value);
        inputted.value = '';

        console.log(wordleStore.isWin);
        console.log(wordleStore.answer);
      } catch (err) {}

      break;
    case 'Backspace':
      if (inputted.value.length <= 0) return;
      inputted.value = inputted.value.slice(0, -1);
      break;
    default:
      if (inputted.value.length >= 5) return;
      inputted.value += key;
      break;
  }
};

onMounted(async () => {
  // 取得遊戲完整資料
  if (!wordleStore.gameId) {
    wordleStore.gameId = Number(route.params.gameId);
  }
  try {
    await wordleStore.game();
  } catch (err) {
    await router.push({ name: 'wordle-setup' });
  }
});

// 離開前重置資料
onBeforeUnmount(() => {
  wordleStore.reset();
});
</script>

<template>
  <DefaultLayout>
    <section class="w-full px-1 flex flex-col items-center overflow-y-hidden">
      <!-- 該局遊戲基本資料：日期、模式、難易度 -->
      <div
        class="w-full grid grid-rows-2 grid-cols-[1fr_auto] leading-none text-end text-sm"
      >
        <p class="row-span-2 font-semibold text-3xl text-start">
          {{ dateParts.day }}
        </p>
        <p class="self-end text-(--aj-color-muted)">
          {{ wordleStore.mode }}
        </p>
        <p class="text-(--aj-color-subtle)">{{ wordleStore.difficulty }}</p>
      </div>

      <!-- 遊戲結束資料：輸贏、解答、跳轉分享按鈕 -->
      <div
        v-if="wordleStore.isGameOver"
        class="w-full flex mt-2 py-2 px-2 justify-between items-center border border-(--aj-color-border) rounded-md"
      >
        <p class="text-xs">
          <mark
            class="px-1.5 font-semibold text-lg tracking-widest mark-highlight"
          >
            {{ wordleStore.answer?.toUpperCase() }}
          </mark>
          (謎底)
        </p>

        <RouterLink
          :to="{
            name: 'wordle-share',
            params: { shareToken: wordleStore.shareToken }
          }"
          class="btn-primary flex items-center text-xs"
        >
          前往結果分享頁 →
        </RouterLink>
      </div>

      <!-- 已猜測單字紀錄 -->
      <div
        ref="scrollDom"
        class="grow w-full flex flex-col my-4 overflow-y-auto"
      >
        <ul class="mt-auto w-full flex flex-col items-center gap-y-2">
          <li
            v-for="(item, index) in wordleStore.guesses"
            :key="item.guessWord"
            class="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center"
          >
            <p
              v-for="(word, idx) in item.guessWord"
              :key="item.guessWord + idx"
              class="wordle-item w-[1.5ch] text-2xl text-center"
              :class="toneClasses[item.result[idx]]"
            >
              {{ word.toUpperCase() }}
            </p>
            <span
              class="ms-2 px-0.5 min-w-[2ch] text-sm text-center text-(--aj-color-subtle) bg-(--aj-color-surface) rounded select-none"
            >
              {{ index + 1 }}
            </span>
          </li>
        </ul>
      </div>

      <p class="mx-auto my-3 text-xs text-(--aj-color-subtle)">
        ↑ 以上紀錄猜過的詞，剩餘機會：{{ wordleStore.remainder }} 次 ↑
      </p>

      <!-- 當前輸入框 -->
      <div
        class="shrink-0 mt-auto w-[10ch] flex items-center py-1 px-2 text-2xl bg-(--aj-color-surface) border border-(--aj-color-border) rounded-md select-none"
      >
        <p
          v-for="(val, idx) in inputted"
          :key="`input-${idx}`"
          class="w-[1.5ch] text-center"
        >
          {{ val }}
        </p>
        <span
          class="h-[70%] w-1 text-transparent border-r-[0.1rem] border-(--aj-color-border-active) animate-[blink_1s_step-end_infinite]"
          :class="{ 'border-transparent!': wordleStore.isGameOver }"
        >
          /
        </span>
        <span class="ms-auto mt-0.5 text-xs text-(--aj-color-subtle)"> ↵ </span>
      </div>
    </section>

    <template #footer>
      <!-- 虛擬鍵盤 -->
      <KeyBoard
        @press="handleKeyPress"
        :keyDecorations="wordleStore.keyDecorations"
      />
    </template>
  </DefaultLayout>
</template>

<style scoped>
@reference '@/assets/styles/style';

.wordle-item {
  position: relative;
  color: var(--wordle-text);
  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  &::before {
    bottom: 5%;
    height: 0.16rem;
    aspect-ratio: 1 / 1;
    background-color: var(--wordle-dot);
    border-radius: 100%;
  }
  &::after {
    bottom: 7%;
    width: 70%;
    border-bottom: 0.1rem solid var(--wordle-border);
  }
}
.wordle-g {
  --wordle-text: var(--aj-tone-success-text);
  --wordle-dot: transparent;
  --wordle-border: var(--aj-tone-success-text);
}
.wordle-y {
  --wordle-text: var(--aj-tone-warning-text);
  --wordle-dot: var(--aj-tone-warning-text);
  --wordle-border: transparent;
}
.wordle-w {
  --wordle-text: var(--aj-color-subtle);
  --wordle-dot: transparent;
  --wordle-border: transparent;
}
</style>
