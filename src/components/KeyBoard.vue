<script setup lang="ts">
import { type Component, computed } from 'vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { BackspaceIcon } from '@heroicons/vue/24/outline';
import keyboardTapSoundUrl from '@/assets/sounds/keyboard-tap.mp3';

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
    offsetClass: 'translate-x-4.5',
    buttons: [
      { key: 'A' },
      { key: 'S' },
      { key: 'D' },
      { key: 'F' },
      { key: 'G' },
      { key: 'H' },
      { key: 'J' },
      { key: 'K' },
      { key: 'L' }
    ]
  },
  {
    id: 'bottom-row',
    offsetClass: 'translate-x-4.5',
    buttons: [
      {
        key: 'Backspace',
        extraClass: 'plus justify-self-end',
        icon: BackspaceIcon
      },
      { key: 'Z' },
      { key: 'X' },
      { key: 'C' },
      { key: 'V' },
      { key: 'B' },
      { key: 'N' },
      { key: 'M' },
      {
        key: 'Enter',
        extraClass: 'plus',
        label: '↵',
        labelClass: 'translate-y-0.5'
      }
    ]
  }
];

type KeyboardKeyDecoration = {
  keys: Set<string>;
  className: string;
};

// 外層組件給獨立按鍵傳遞指定樣式
interface KeyBoardProps {
  keyDecorations?: KeyboardKeyDecoration[];
}
const props = withDefaults(defineProps<KeyBoardProps>(), {
  keyDecorations: () => []
});
const keyboardRowsWrapped = computed(() => {
  return keyboardRows.map((row) => ({
    ...row,
    buttons: row.buttons.map((button) => {
      const classNames = props.keyDecorations
        .filter((decoration) => decoration.keys.has(button.key))
        .map((decoration) => decoration.className);

      if (!classNames.length) return button;

      return {
        ...button,
        extraClass: [button.extraClass, ...classNames].filter(Boolean).join(' ')
      };
    })
  }));
});

// 敲擊鍵盤音效
// 最簡單的音效寫法是：new Audio('sound.mp3').play()
// 但 Safari 對這種方式反應很慢，因為每次都要重新建立物件、解碼音檔，來不及處理就跳過了
// 所以改用 Web Audio API，核心概念是把音效的「載入」和「播放」完全分開

// 做法是先把 mp3 解碼成 AudioBuffer，之後每次按鍵都只建立新的播放來源
let audioContext: AudioContext | null = null; // 類似錄音室，代表整個音訊環境
let pressBuffer: AudioBuffer | null = null; // 已經解碼好的音效資料
let audioLoadTask: Promise<void> | null = null; // 預載中的任務，避免重複抓同一份音檔
let audioWarmedUp = false; // 預熱音效（在初次觸發虛擬鍵盤時）

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;

  // Safari 與其他瀏覽器的 AudioContext 取得方式不完全一樣，這裡做相容處理
  const AudioContextCtor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextCtor) return null;
  if (!audioContext) audioContext = new AudioContextCtor();

  return audioContext;
};

const loadPressBuffer = async () => {
  if (typeof window === 'undefined' || pressBuffer) return;

  const context = getAudioContext();
  if (!context) return;

  // 先把靜態音檔抓下來，再交給 Web Audio 解碼成可直接播放的緩衝資料
  // 這樣按鍵當下就不用再做檔案載入或解碼，播放會快很多
  const response = await fetch(keyboardTapSoundUrl);
  const arrayBuffer = await response.arrayBuffer();
  pressBuffer = await context.decodeAudioData(arrayBuffer);
};

const ensureAudioLoaded = () => {
  if (!audioLoadTask) {
    // 只建立一次載入任務，避免元件掛載或多次互動時重複抓同一份音檔
    audioLoadTask = loadPressBuffer().catch(() => {
      pressBuffer = null;
    });
  }

  return audioLoadTask;
};

const warmUpAudio = () => {
  if (audioWarmedUp) return;
  audioWarmedUp = true;
  void ensureAudioLoaded();
};

const playPressSound = async () => {
  const context = getAudioContext();
  if (!context) return;

  await ensureAudioLoaded();
  if (!pressBuffer) return;

  // Safari 常會把音訊上下文維持在 suspended，這裡先嘗試恢復
  if (context.state === 'suspended') {
    // 即使出錯也不管，讓聲音繼續嘗試播放
    context.resume().catch(() => {});
  }

  // 每次播放都建立新的 source
  // 這是關鍵，因為同一個 source 不能重複播放，也不會被後續按鍵覆蓋
  const source = context.createBufferSource();
  // 用 gain 控制音量，避免直接把原始音檔音量放得太大
  const gain = context.createGain();

  source.buffer = pressBuffer;
  gain.gain.value = 0.2;

  source.connect(gain);
  gain.connect(context.destination);
  source.start();
  source.onended = () => {
    // 播放完後手動斷開連線，讓瀏覽器盡快回收資源
    source.disconnect();
    gain.disconnect();
  };
};

// 傳遞當前被敲擊的鍵
const emit = defineEmits<{
  (event: 'press', key: string): void;
}>();

const pressedKey = ref<string | null>(null);
const clearPressedKey = () => {
  pressedKey.value = null;
};
const clearPressedKeyForKey = (key: string) => {
  if (pressedKey.value !== key) return;
  clearPressedKey();
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
  warmUpAudio();

  const target = event.currentTarget as HTMLButtonElement | null;
  const key = target?.dataset.key;
  if (!key || !target) return;

  pressedKey.value = key;
  void playPressSound();
  emit('press', key);
  target.setPointerCapture(event.pointerId);
};

// 虛擬鍵盤鬆開
const handlePointerUp = (key: string) => {
  clearPressedKeyForKey(key);
};

// 實體鍵盤按下
const handleKeyDown = (event: KeyboardEvent) => {
  warmUpAudio();

  const key = normalizeKey(event.key);

  // 排除虛擬鍵盤以外的鍵 + 長按時避免連發
  if (!isSupportedKey(key) || event.repeat) return;

  // 避免阻擋到重要快捷鍵
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  event.preventDefault();
  pressedKey.value = key;
  void playPressSound();
  emit('press', key);
};

// 實體鍵盤鬆開
const handleKeyUp = (event: KeyboardEvent) => {
  const key = normalizeKey(event.key);
  clearPressedKeyForKey(key);
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

  if (audioContext) {
    // 關閉音訊上下文，避免元件卸載後仍持有瀏覽器資源，不需處理錯誤
    void audioContext.close().catch(() => {});
    audioContext = null;
  }
  pressBuffer = null;
  audioLoadTask = null;
  audioWarmedUp = false;
});
</script>

<template>
  <div
    class="keyboard grow flex flex-col items-center gap-0.5 origin-bottom select-none"
  >
    <div
      v-for="row in keyboardRowsWrapped"
      :key="row.id"
      :class="['keyboard-row', row.offsetClass]"
    >
      <button
        v-for="btn in row.buttons"
        :key="btn.key"
        type="button"
        :data-key="btn.key"
        :class="[btn.extraClass, { 'is-pressed': pressedKey === btn.key }]"
        @pointerdown="handlePointerDown"
        @pointerup="handlePointerUp(btn.key)"
        @pointercancel="clearPressedKeyForKey(btn.key)"
        @blur="clearPressedKeyForKey(btn.key)"
      >
        <span :class="btn.labelClass">
          <component :is="btn.icon" v-if="btn.icon" class="h-3 w-3" />
          <template v-else>{{ btn.label ?? btn.key }}</template>
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
  --keycap-text: var(--aj-color-text);
}
html[data-theme='dark'] .keyboard {
  --keycap-top: #232323;
  --keycap-bottom: #191919;
  --keycap-highlight: #282828;
  --keycap-border: #464646;
  --keycap-border-active: #646464;
  --keycap-shadow: #0a0a0a;
  --keycap-text: var(--aj-color-text);
}

.keyboard-row {
  @apply w-full grid grid-cols-10 gap-0.5 text-center;
}

button {
  @apply flex justify-center items-center p-1 font-normal text-[0.6rem] text-(--keycap-text) border-[0.01rem] border-(--keycap-border) aspect-square rounded-sm transition-transform duration-100 touch-manipulation; /* 去掉 double-tap zoom 延遲 */
  background: radial-gradient(
    75% 75% at 50% 5%,
    var(--keycap-top) 0%,
    var(--keycap-bottom) 100%
  );
  box-shadow:
    inset 0 0.04rem 0.08rem 0.02rem var(--keycap-highlight),
    0 0.03rem 0.06rem 0 var(--keycap-shadow);
  -webkit-tap-highlight-color: transparent; /* 關掉預設的藍/灰色高亮 */
  will-change: transform;
}

button.plus {
  @apply justify-end items-end aspect-auto w-[150%];
}

@media (hover: hover) and (pointer: fine) {
  button:hover {
    @apply border-(--keycap-border-active) translate-y-[-0.05rem];
  }
}

button.is-pressed {
  @apply translate-y-[0.05rem];
  box-shadow:
    inset 0 1px 1px 1px var(--keycap-bottom),
    inset 0 -1px 3px 0 var(--keycap-highlight),
    0 0 0.05rem 0 var(--keycap-shadow),
    0 0.05rem 0.05rem 0 var(--keycap-shadow);
}

span {
  @apply transition-transform duration-100;
}

.dimmed {
  --keycap-text: var(--aj-color-subtle);
}
</style>
