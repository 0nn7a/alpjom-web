<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue';
</script>

<template>
  <section class="h-full w-full flex flex-col items-center py-4 gap-y-4">
    <header class="shrink-0 w-full flex items-center">
      <h1 class="text-xl">alpJom</h1>
      <div class="ms-auto flex items-center gap-2">
        <slot name="header" />
        <ThemeToggle />
      </div>
    </header>

    <div class="grow w-full flex">
      <slot />
    </div>

    <footer class="shrink-0 w-full flex">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped></style>
