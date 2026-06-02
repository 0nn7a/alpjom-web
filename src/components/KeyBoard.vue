<script setup lang="ts">
import { BackspaceIcon } from '@heroicons/vue/24/outline';
</script>

<template>
  <div
    class="keyboard grow flex flex-col items-center gap-0.5 scale-125 origin-bottom select-none"
  >
    <div class="keyboard-row translate-x-1.5">
      <button type="button"><span>Q</span></button>
      <button type="button"><span>W</span></button>
      <button type="button"><span>E</span></button>
      <button type="button"><span>R</span></button>
      <button type="button"><span>T</span></button>
      <button type="button"><span>Y</span></button>
      <button type="button"><span>U</span></button>
      <button type="button"><span>I</span></button>
      <button type="button"><span>O</span></button>
      <button type="button"><span>P</span></button>
    </div>
    <div class="keyboard-row">
      <button type="button"><span>A</span></button>
      <button type="button"><span>S</span></button>
      <button type="button"><span>D</span></button>
      <button type="button"><span>F</span></button>
      <button type="button"><span>G</span></button>
      <button type="button"><span>H</span></button>
      <button type="button"><span>J</span></button>
      <button type="button"><span>K</span></button>
      <button type="button"><span>L</span></button>
      <button type="button" class="plus">
        <span class="translate-y-0.5">↵</span>
      </button>
    </div>
    <div class="keyboard-row translate-x-5.5">
      <button type="button"><span>Z</span></button>
      <button type="button"><span>X</span></button>
      <button type="button"><span>C</span></button>
      <button type="button"><span>V</span></button>
      <button type="button"><span>B</span></button>
      <button type="button"><span>N</span></button>
      <button type="button"><span>M</span></button>
      <button type="button" class="plus">
        <span>
          <BackspaceIcon class="h-3 w-3" />
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
button:hover {
  @apply text-(--aj-colot-text) border-(--keycap-border-active) translate-y-[-2%];
}
button:active {
  @apply translate-y-0;
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
