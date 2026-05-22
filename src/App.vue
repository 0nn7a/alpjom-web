<script setup lang="ts">
import { useRoute } from 'vue-router';
import ToastHost from '@/components/ToastHost.vue';

const route = useRoute();
</script>

<template>
  <ToastHost />
  <RouterView :key="route.name" />
</template>
