<script setup lang="ts">
import { watch, onUnmounted } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';

interface Props {
  title?: string;
  description?: string;
  closeOnOverlay?: boolean;
}

const open = defineModel<boolean>({ default: false });

const props = withDefaults(defineProps<Props>(), {
  closeOnOverlay: true
});

const close = () => (open.value = false);

function handleOverlayClick() {
  if (props.closeOnOverlay) close();
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) close();
}

watch(open, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
});

document.addEventListener('keydown', handleKeydown);
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 grid p-3 place-items-center bg-(--aj-color-text)/5 backdrop-blur-sm"
        @click.self="handleOverlayClick"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'dialog-title' : undefined"
        :aria-describedby="description ? 'dialog-description' : undefined"
      >
        <Transition name="dialog-panel">
          <div
            v-if="open"
            class="relative max-h-full w-full max-w-80 min-w-55 flex flex-col p-4 bg-(--aj-color-bg) border border-(--aj-color-border) rounded-lg shadow-lg overflow-hidden"
          >
            <!-- 關閉按鈕 -->
            <button
              @click="close"
              class="absolute top-3 right-3 p-1 text-(--aj-color-text)/30 rounded-md cursor-pointer transition-all duration-100 hover:text-(--aj-color-text)/60 hover:bg-(--aj-color-surface)"
              aria-label="關閉"
            >
              <XMarkIcon class="h-4 w-4" />
            </button>

            <!-- Header -->
            <div class="shrink-0 overflow-hidden">
              <slot name="header">
                <h2
                  v-if="title"
                  id="dialog-title"
                  class="mr-6 text-lg font-semibold text-(--aj-color-text)"
                >
                  {{ title }}
                </h2>
                <p
                  v-if="description"
                  id="dialog-description"
                  class="mt-1.5 text-sm text-(--aj-color-subtle)"
                >
                  {{ description }}
                </p>
              </slot>
            </div>

            <!-- Body -->
            <template v-if="$slots.default">
              <div class="shrink-0 my-4 h-px bg-(--aj-color-ring)" />
              <div class="grow overflow-y-auto">
                <slot />
              </div>
            </template>

            <!-- Footer -->
            <template v-if="$slots.footer">
              <div class="shrink-0 my-4 h-px bg-(--aj-color-ring)" />
              <div class="shrink-0 flex items-center justify-end gap-2">
                <slot name="footer" :close="close" />
              </div>
            </template>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.dialog-panel-enter-active,
.dialog-panel-leave-active {
  transition: all 0.2s ease-in-out;
}
.dialog-panel-enter-from,
.dialog-panel-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
</style>
