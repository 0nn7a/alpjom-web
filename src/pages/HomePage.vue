<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.ts';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

const authStore = useAuthStore();

const logout = async () => {
  await authStore.logout();
};
</script>

<template>
  <DefaultLayout>
    <section class="m-auto flex flex-col justify-center items-center gap-y-1">
      <p class="text-2xl">Welcome to alpJom!</p>

      <RouterLink
        :to="{ name: 'wordle-setup' }"
        class="text-sm text-(--aj-color-subtle) transition duration-300 hover:text-(--aj-color-muted)"
      >
        → Go to wordle
      </RouterLink>
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

      <button type="button" class="mt-6 btn-primary" @click="logout">
        Logout
      </button>
    </section>
  </DefaultLayout>
</template>

<style scoped></style>
