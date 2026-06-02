<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useThemeStore } from '@/stores/theme.ts';
import ToastHost from '@/components/ToastHost.vue';

const route = useRoute();
const themeStore = useThemeStore();

onMounted(() => {
  themeStore.initTheme();
});
</script>

<template>
  <main class="w-full max-w-96 flex flex-col px-10">
    <ToastHost />
    <RouterView :key="route.name" />
  </main>
</template>
