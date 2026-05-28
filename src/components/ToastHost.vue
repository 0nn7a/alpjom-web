<script setup lang="ts">
import type { Component } from 'vue';
import { storeToRefs } from 'pinia';
import { useToastStore, type ToastTone } from '@/stores/toast';
import {
  InformationCircleIcon,
  HandThumbUpIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon
} from '@heroicons/vue/24/outline';

const toastStore = useToastStore();
const { toasts } = storeToRefs(toastStore);

const toneClasses: Record<ToastTone, string> = {
  info: 'toast-info',
  success: 'toast-success',
  warning: 'toast-warning',
  error: 'toast-error'
};
const toneIcons: Record<ToastTone, Component> = {
  info: InformationCircleIcon,
  success: HandThumbUpIcon,
  warning: ExclamationTriangleIcon,
  error: NoSymbolIcon
};
</script>

<template>
  <Teleport to="#toast">
    <div
      class="pointer-events-none fixed left-1/2 top-5 z-9999 flex -translate-x-1/2 flex-col items-center gap-2"
      role="status"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item flex items-center max-w-full px-4 py-3 gap-x-2 text-sm text-start leading-snug border rounded-md"
          :class="toneClasses[toast.tone]"
        >
          <Component :is="toneIcons[toast.tone]" class="shrink-0 h-5" />
          <p class="whitespace-pre-line">{{ toast.message }}</p>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-item {
  border-color: var(--toast-border);
  background-color: var(--toast-bg);
  color: var(--toast-text);
  box-shadow: 0 10px 15px -3px var(--toast-shadow);
}

.toast-info {
  --toast-bg: var(--aj-tone-info-bg);
  --toast-text: var(--aj-tone-info-text);
  --toast-border: var(--aj-tone-info-border);
  --toast-shadow: var(--aj-tone-info-shadow);
}

.toast-success {
  --toast-bg: var(--aj-tone-success-bg);
  --toast-text: var(--aj-tone-success-text);
  --toast-border: var(--aj-tone-success-border);
  --toast-shadow: var(--aj-tone-success-shadow);
}

.toast-warning {
  --toast-bg: var(--aj-tone-warning-bg);
  --toast-text: var(--aj-tone-warning-text);
  --toast-border: var(--aj-tone-warning-border);
  --toast-shadow: var(--aj-tone-warning-shadow);
}

.toast-error {
  --toast-bg: var(--aj-tone-error-bg);
  --toast-text: var(--aj-tone-error-text);
  --toast-border: var(--aj-tone-error-border);
  --toast-shadow: var(--aj-tone-error-shadow);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-0.8rem);
}

.toast-move {
  transition: transform 180ms ease;
}
</style>
