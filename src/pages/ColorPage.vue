<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
</script>

<template>
  <DefaultLayout>
    <div class="w-full flex flex-col justify-center items-center gap-y-1">
      <p class="text-(--aj-color-text)">text</p>
      <p class="text-(--aj-color-muted)">muted</p>
      <p class="text-(--aj-color-surface)">surface</p>
      <p class="text-(--aj-color-surface-hover)">surface-hover</p>
      <p class="text-(--aj-color-border)">border</p>
      <p class="text-(--aj-color-ring)">ring</p>
      <p class="text-(--aj-color-placeholder)">placeholder</p>
      <br />

      <p class="text-(--aj-color-danger)">danger</p>
      <p class="text-(--aj-color-danger-muted)">danger-muted</p>
      <p class="text-(--aj-color-danger-border)">danger-border</p>
      <p class="text-(--aj-color-danger-ring)">danger-ring</p>
    </div>
  </DefaultLayout>
</template>

<style scoped></style>
