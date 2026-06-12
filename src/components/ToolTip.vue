<script lang="ts" setup>
import { useTooltipStore } from '@/stores/tooltip';
const tooltipStore = useTooltipStore();
</script>

<!--
  全域唯一的 Tooltip 組件，掛在 App.vue 根層即可。
  內容透過 default slot 渲染，由各呼叫方傳入 template。

  基本用法（純文字）：
    <AppTooltip>
      <template #default="{ content }">{{ content }}</template>
    </AppTooltip>

  進階用法（自訂格式）：
    <AppTooltip>
      <template #default="{ content }">
        <span class="tooltip-date">{{ content.date }}</span>
        <span class="tooltip-count">完成 {{ content.count }} 局</span>
      </template>
    </AppTooltip>
-->

<template>
  <Teleport to="body">
    <div
      v-if="tooltipStore.visible"
      :ref="
        (el) => {
          tooltipStore.tooltipEl = el as HTMLElement | null;
        }
      "
      class="tooltip"
      :style="{
        left: `${tooltipStore.x}px`,
        top: `${tooltipStore.y}px`
      }"
      role="tooltip"
    >
      <slot :content="tooltipStore.content">
        <!-- fallback：content 是字串時直接顯示 -->
        {{ tooltipStore.content }}
      </slot>
    </div>
  </Teleport>
</template>

<style scoped>
@reference '@/assets/styles/style';

.tooltip {
  @apply fixed z-9999 py-1 px-2 text-xs text-(--aj-color-bg) bg-(--aj-color-text) rounded shadow-sm shadow-neutral-500 pointer-events-none whitespace-nowrap animate-[tooltip-in_0.1s_ease-in_both];
}

@keyframes tooltip-in {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
