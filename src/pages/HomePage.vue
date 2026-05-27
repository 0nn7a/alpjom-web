<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.ts';

const authStore = useAuthStore();

const logout = async () => {
  await authStore.logout();
};
</script>

<template>
  <section class="my-auto flex flex-col justify-center items-center gap-y-1">
    <p class="text-2xl">Welcome to alpJom!</p>
    <RouterLink
      :to="{ name: 'profile' }"
      class="text-sm text-neutral-400 transition duration-300 hover:text-neutral-600"
    >
      → Go to profile
    </RouterLink>
    <button
      type="button"
      class="mt-6 text-xl py-2 px-4 bg-neutral-100 border border-neutral-300 rounded-md cursor-pointer transition duration-300 hover:border-neutral-400"
      @click="logout"
    >
      Logout
    </button>
  </section>
</template>

<style scoped></style>
