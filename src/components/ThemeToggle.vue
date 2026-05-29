<script setup lang="ts">
import { computed } from 'vue';
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/vue/24/outline';
import { THEME_PREFERENCES, useThemeStore } from '@/stores/theme.ts';

const themeStore = useThemeStore();

const themeOptionMeta = {
  light: {
    label: 'Light',
    icon: SunIcon
  },
  dark: {
    label: 'Dark',
    icon: MoonIcon
  },
  system: {
    label: 'System',
    icon: ComputerDesktopIcon
  }
} as const;

const activeThemeIndex = computed(() =>
  THEME_PREFERENCES.indexOf(themeStore.preference)
);
</script>

<template>
  <div
    class="relative grid grid-cols-3 p-2 gap-2.5 items-center overflow-hidden bg-(--aj-color-surface) border border-(--aj-color-border) rounded-md"
  >
    <div
      class="absolute inset-1 w-7 bg-(--aj-color-bg) shadow-sm rounded-md pointer-events-none transition-[left] duration-300 ease-in-out"
      :style="{
        left: `calc(0.25rem + (100% / 3 - 0.125rem) * ${activeThemeIndex})`
      }"
    />

    <button
      v-for="value in THEME_PREFERENCES"
      :key="value"
      type="button"
      class="flex h-5 w-5 items-center justify-center rounded-full cursor-pointer transition-all duration-300"
      :class="
        themeStore.preference === value
          ? 'scale-105 text-(--aj-color-text)'
          : 'text-(--aj-color-subtle) hover:text-(--aj-color-muted)'
      "
      :aria-pressed="themeStore.preference === value"
      :aria-label="`Set theme to ${themeOptionMeta[value].label}`"
      @click="themeStore.setTheme(value)"
    >
      <component :is="themeOptionMeta[value].icon" class="h-full w-full" />
    </button>
  </div>
</template>

<style scoped></style>
