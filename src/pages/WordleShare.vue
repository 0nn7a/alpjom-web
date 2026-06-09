<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useWordleStore } from '@/stores/wordle.ts';
import type { WordleShareResponse } from '@/types/wordle.ts';

const route = useRoute();
const wordleStore = useWordleStore();

const data = ref<WordleShareResponse | null>(null);

onMounted(async () => {
  data.value = await wordleStore.share(route.params.shareToken as string);
});
onBeforeUnmount(() => {
  wordleStore.reset();
});
</script>

<template>
  <pre>{{ JSON.stringify(data, null, 2) }}</pre>
</template>

<style scoped></style>
