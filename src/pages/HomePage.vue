<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.ts';
import { useRouter } from 'vue-router';
import { useToastStore } from '@/stores/toast.ts';

const authStore = useAuthStore();
const toastStore = useToastStore();
const router = useRouter();

const logout = async () => {
  await authStore.logout();
  toastStore.notify('登出成功！', { tone: 'success' });
  await router.push({ name: 'login' });
};
</script>

<template>
  <section class="my-auto flex flex-col justify-center items-center">
    <p class="text-2xl mb-3">Welcome to alpJom!</p>
    <button
      type="button"
      class="text-2xl py-2 px-4 bg-neutral-100 border border-neutral-300 rounded-md cursor-pointer transition duration-300 hover:border-neutral-400"
      @click="logout"
    >
      Logout
    </button>
  </section>
</template>

<style scoped></style>
