<script setup lang="ts">
import type { Component } from 'vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { BackspaceIcon } from '@heroicons/vue/24/outline';

type KeyboardButton = {
  key: string;
  label?: string;
  extraClass?: string;
  labelClass?: string;
  icon?: Component;
};

type KeyboardRow = {
  id: string;
  offsetClass?: string;
  buttons: KeyboardButton[];
};

const keyboardRows: KeyboardRow[] = [
  {
    id: 'top-row',
    offsetClass: 'translate-x-3',
    buttons: [
      { key: 'Q' },
      { key: 'W' },
      { key: 'E' },
      { key: 'R' },
      { key: 'T' },
      { key: 'Y' },
      { key: 'U' },
      { key: 'I' },
      { key: 'O' },
      { key: 'P' }
    ]
  },
  {
    id: 'middle-row',
    buttons: [
      { key: 'A' },
      { key: 'S' },
      { key: 'D' },
      { key: 'F' },
      { key: 'G' },
      { key: 'H' },
      { key: 'J' },
      { key: 'K' },
      { key: 'L' },
      {
        key: 'Enter',
        extraClass: 'plus',
        label: '↵',
        labelClass: 'translate-y-0.5'
      }
    ]
  },
  {
    id: 'bottom-row',
    offsetClass: 'translate-x-6',
    buttons: [
      { key: 'Z' },
      { key: 'X' },
      { key: 'C' },
      { key: 'V' },
      { key: 'B' },
      { key: 'N' },
      { key: 'M' },
      { key: 'Backspace', extraClass: 'plus', icon: BackspaceIcon }
    ]
  }
];

const emit = defineEmits<{
  (event: 'press', key: string): void;
}>();

const pressedKey = ref<string | null>(null);
const clearPressedKey = () => {
  pressedKey.value = null;
};

// 判斷是否為支援按鍵
const supportedKeys = new Set(
  keyboardRows.flatMap((row) => row.buttons.map((button) => button.key))
);
const isSupportedKey = (key: string) => supportedKeys.has(key);

// 避免鍵盤輸入字母時受大小寫、輸入法影響，統一轉為大寫
const normalizeKey = (key: string) => {
  if (key.length === 1) return key.toUpperCase();
  return key;
};

// 虛擬鍵盤點擊
const handlePointerDown = (event: PointerEvent) => {
  const target = event.currentTarget as HTMLButtonElement | null;
  const key = target?.dataset.key;
  if (!key || !target) return;

  pressedKey.value = key;
  target.setPointerCapture(event.pointerId);
};

// 虛擬鍵盤鬆開
const handlePointerUp = (event: PointerEvent) => {
  const target = event.currentTarget as HTMLButtonElement | null;
  const key = target?.dataset.key;
  if (!key) return;

  emit('press', key);
  clearPressedKey();
};

// 實體鍵盤按下
const handleKeyDown = (event: KeyboardEvent) => {
  const key = normalizeKey(event.key);

  // 排除虛擬鍵盤以外的鍵 + 長按時避免連發
  if (!isSupportedKey(key) || event.repeat) return;

  // 避免阻擋到重要快捷鍵
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  event.preventDefault();
  pressedKey.value = key;
  emit('press', key);
};

// 實體鍵盤鬆開
const handleKeyUp = (event: KeyboardEvent) => {
  const key = normalizeKey(event.key);
  if (pressedKey.value === key) clearPressedKey();
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // 視窗失焦或切頁時用來清空按下狀態，避免使用者切走視窗後 UI 卡住
  window.addEventListener('blur', clearPressedKey);
  document.addEventListener('visibilitychange', clearPressedKey);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  window.removeEventListener('blur', clearPressedKey);
  document.removeEventListener('visibilitychange', clearPressedKey);
});
</script>

<template>
  <div
    class="keyboard grow flex flex-col items-center gap-0.5 scale-125 origin-bottom select-none"
  >
    <div
      v-for="row in keyboardRows"
      :key="row.id"
      :class="['keyboard-row', row.offsetClass]"
    >
      <button
        v-for="button in row.buttons"
        :key="button.key"
        type="button"
        :data-key="button.key"
        :class="[
          button.extraClass,
          { 'is-pressed': pressedKey === button.key }
        ]"
        @pointerdown="handlePointerDown"
        @pointerup="handlePointerUp"
        @pointercancel="clearPressedKey"
        @blur="clearPressedKey"
      >
        <span :class="button.labelClass">
          <component :is="button.icon" v-if="button.icon" class="h-2.5 w-2.5" />
          <template v-else>{{ button.label ?? button.key }}</template>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/styles/style.css";

.keyboard {
  --keycap-top: #fdfdfd;
  --keycap-bottom: #f3f3f3;
  --keycap-highlight: white;
  --keycap-border: #e3e3e3;
  --keycap-border-active: #c8c8c8;
  --keycap-shadow: #e6e6e6;
}
html[data-theme='dark'] .keyboard {
  --keycap-top: #232323;
  --keycap-bottom: #191919;
  --keycap-highlight: #282828;
  --keycap-border: #464646;
  --keycap-border-active: #646464;
  --keycap-shadow: #0a0a0a;
}

.keyboard-row {
  @apply w-full grid grid-cols-11 gap-0.5 text-center;
}

button {
  @apply flex justify-center items-center p-1 font-normal text-[0.55rem] text-(--aj-color-muted) border-[0.01rem] border-(--keycap-border) aspect-square rounded-sm transition-all duration-150 touch-manipulation; /* 去掉 double-tap zoom 延遲 */
  background: radial-gradient(
    75% 75% at 50% 5%,
    var(--keycap-top) 0%,
    var(--keycap-bottom) 100%
  );
  box-shadow:
    inset 0 0.05rem 1px 1px var(--keycap-highlight),
    0 0 0.05rem 0 var(--keycap-shadow),
    0 0.05rem 0.05rem 0 var(--keycap-shadow);
  -webkit-tap-highlight-color: transparent; /* 關掉預設的藍/灰色高亮 */
}

@media (hover: hover) and (pointer: fine) {
  button:hover {
    @apply text-(--aj-color-text) border-(--keycap-border-active) translate-y-[-1%];
  }
}

button:active,
button.is-pressed {
  @apply translate-y-[2%];
  box-shadow:
    inset 0 1px 1px 1px var(--keycap-bottom),
    inset 0 -1px 3px 0 var(--keycap-highlight),
    0 0 0.05rem 0 var(--keycap-shadow),
    0 0.05rem 0.05rem 0 var(--keycap-shadow);
}

span {
  @apply transition-all duration-100;
}

button.plus {
  @apply col-span-2 justify-end items-end aspect-auto;
}
</style>
