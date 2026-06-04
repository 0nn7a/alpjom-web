<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue';
</script>

<template>
  <section
    class="h-full w-full flex flex-col items-center my-3 gap-y-4 overflow-hidden"
  >
    <header class="shrink-0 w-full flex items-center">
      <RouterLink :to="{ name: 'home' }" class="ms-1 font-semibold text-xl">
        alpJom
      </RouterLink>
      <div class="ms-auto flex items-center gap-2">
        <slot name="header" />
        <ThemeToggle />
      </div>
    </header>

    <div class="grow w-full flex overflow-y-hidden">
      <slot />
    </div>

    <footer class="shrink-0 w-full flex">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped></style>
