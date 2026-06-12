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
    <section class="m-auto flex flex-col justify-center items-center gap-y-3">
      <p class="text-2xl">Welcome to alpJom!</p>
      <button type="button" class="btn-primary" @click="logout">Logout</button>
    </section>
  </DefaultLayout>
</template>

<style scoped></style>
