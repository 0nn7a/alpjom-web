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
  info: 'border-neutral-300 bg-neutral-50 text-neutral-900 shadow-neutral-200/80',
  success:
    'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-emerald-100/80',
  warning: 'border-amber-300 bg-amber-50 text-amber-900 shadow-amber-100/80',
  error: 'border-red-300 bg-red-50 text-red-900 shadow-red-100/80'
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
          class="flex items-center max-w-full px-4 py-3 gap-x-2 text-sm text-start leading-snug border rounded-md shadow-lg"
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
