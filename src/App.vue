<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useThemeStore } from '@/stores/theme.ts';
import ToastHost from '@/components/ToastHost.vue';
import { useAuthStore } from '@/stores/auth.ts';

const route = useRoute();
const themeStore = useThemeStore();
const authStore = useAuthStore();

onMounted(() => {
  themeStore.initTheme();
  authStore.initUser();
});
</script>

<template>
  <main class="h-full w-full max-w-96 flex flex-col overflow-hidden">
    <ToastHost />
    <RouterView :key="route.name" />
  </main>
</template>
