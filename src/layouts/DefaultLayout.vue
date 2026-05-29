<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue';
</script>

<template>
  <main class="w-full flex flex-col items-center pt-4 bg-(--aj-color-bg)">
    <nav class="flex mt-2">
      <ThemeToggle />
    </nav>

    <div class="grow w-full flex">
      <RouterView />
    </div>
  </main>
</template>

<style scoped></style>
