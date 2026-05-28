<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.ts';

const authStore = useAuthStore();

const logout = async () => {
  await authStore.logout();
};
</script>

<template>
  <section class="m-auto flex flex-col justify-center items-center gap-y-1">
    <p class="text-2xl">Welcome to alpJom!</p>

    <RouterLink
      :to="{ name: 'profile' }"
      class="text-sm text-(--aj-color-subtle) transition duration-300 hover:text-(--aj-color-muted)"
    >
      → Go to profile
    </RouterLink>
    <RouterLink
      :to="{ name: 'color' }"
      class="text-sm text-(--aj-color-subtle) transition duration-300 hover:text-(--aj-color-muted)"
    >
      → Go to color
    </RouterLink>

    <button
      type="button"
      class="mt-6 py-1 px-3 bg-(--aj-color-surface) border border-(--aj-color-border) rounded-md cursor-pointer transition duration-300 hover:border-(--aj-color-border-active)"
      @click="logout"
    >
      Logout
    </button>
  </section>
</template>

<style scoped></style>
