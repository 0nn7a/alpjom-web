<script setup lang="ts">
import { Bars2Icon } from '@heroicons/vue/24/outline';
import ThemeToggle from '@/components/ThemeToggle.vue';
import DropMenu from '@/components/DropMenu.vue';
</script>

<template>
  <section
    class="h-full w-full flex flex-col items-center my-3 p-4 gap-y-4 overflow-y-hidden"
  >
    <header class="shrink-0 -m-4 mb-0 w-full flex items-center">
      <DropMenu>
        <template #trigger="{ toggle, open }">
          <Bars2Icon
            class="h-9 aspect-square p-1.5 rounded-md cursor-pointer transition-all duration-300 hover:bg-(--aj-color-surface)"
            :class="{ 'bg-(--aj-color-surface)': open }"
            @click="toggle"
          />
        </template>
      </DropMenu>

      <div class="ms-auto flex items-center gap-2">
        <slot name="header" />
        <ThemeToggle />
      </div>
    </header>

    <div class="grow -mx-4 w-full flex overflow-y-hidden">
      <slot />
    </div>

    <footer class="shrink-0 -m-4 mt-0 w-full flex">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped></style>
