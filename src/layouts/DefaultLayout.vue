<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue';
</script>

<template>
  <section class="h-full w-full flex flex-col items-center py-4 gap-y-4">
    <header class="shrink-0 w-full flex">
      <slot name="header-left" />
      <div class="mx-auto">
        <ThemeToggle />
      </div>
      <slot name="header-right" />
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
