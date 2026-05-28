<script setup lang="ts">
import { useThemeStore } from '@/stores/theme.ts';
const themeStore = useThemeStore();
</script>

<template>
  <main class="w-full flex flex-col items-center">
    <nav class="flex pt-6 gap-x-2">
      <button
        type="button"
        class="py-1 px-3 rounded bg-(--aj-color-surface) border border-(--aj-color-border) hover:bg-(--aj-color-surface-hover) cursor-pointer transition-all duration-300"
        @click="themeStore.setTheme('light')"
      >
        Light Theme
      </button>
      <button
        type="button"
        class="py-1 px-3 rounded bg-(--aj-color-surface) border border-(--aj-color-border) hover:bg-(--aj-color-surface-hover) cursor-pointer transition-all duration-300"
        @click="themeStore.setTheme('dark')"
      >
        Dark Theme
      </button>
      <button
        type="button"
        class="py-1 px-3 rounded bg-(--aj-color-surface) border border-(--aj-color-border) hover:bg-(--aj-color-surface-hover) cursor-pointer transition-all duration-300"
        @click="themeStore.setTheme('system')"
      >
        System Theme
      </button>
    </nav>
    <div class="grow w-full flex">
      <RouterView />
    </div>
  </main>
</template>

<style scoped></style>
