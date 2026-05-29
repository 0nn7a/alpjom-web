import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'alpJom-theme';

function isThemePreference(value: string | null): value is ThemePreference {
  return value !== null && THEME_PREFERENCES.includes(value as ThemePreference);
}

export const useThemeStore = defineStore('theme', () => {
  const preference = ref<ThemePreference>('system');
  const systemTheme = ref<ResolvedTheme>('light');

  const resolvedTheme = computed<ResolvedTheme>(() => {
    return preference.value === 'system' ? systemTheme.value : preference.value;
  });

  function readSystemTheme(): ResolvedTheme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme() {
    if (resolvedTheme.value === 'dark') {
      document.documentElement.dataset.theme = 'dark';
    } else {
      delete document.documentElement.dataset.theme;
    }
  }

  function setTheme(value: ThemePreference) {
    preference.value = value;
    localStorage.setItem(STORAGE_KEY, value);
    applyTheme();
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);

    preference.value = isThemePreference(savedTheme) ? savedTheme : 'system';
    systemTheme.value = readSystemTheme();
    applyTheme();

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        systemTheme.value = readSystemTheme();
        applyTheme();
      });
  }

  return {
    preference,
    resolvedTheme,
    setTheme,
    initTheme
  };
});
