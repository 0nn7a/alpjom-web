<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { onMounted, ref } from 'vue';
import RollingNumber from '@/components/RollingNumber.vue';
import { gameService } from '@/services/game.ts';
import { ApiError } from '@/types/common.ts';
import { useToastStore } from '@/stores/toast.ts';

const toastStore = useToastStore();
const allSiteGameCount = ref(0);

onMounted(async () => {
  try {
    const { data } = await gameService.countFinished();
    allSiteGameCount.value = data;
  } catch (err) {
    if (err instanceof ApiError)
      toastStore.notify(err.message, { tone: 'error' });
  }
});
</script>

<template>
  <DefaultLayout>
    <section
      class="my-14 flex flex-col px-2 justify-start items-start overflow-y-auto"
    >
      <span class="fixed -z-10 top-8 -right-16 h-52 w-screen pattern-dot" />
      <span class="fixed -z-10 -bottom-32 -left-32 h-96 w-screen pattern-dot" />

      <p class="mb-3 text-description">Think you know your words?</p>

      <p class="mb-3 text-flow">
        <span class="font-semibold text-2xl px-1 mark-highlight">
          "alpJom"
        </span>
        <img
          class="photo"
          src="https://pub-bf0bdbb9cd5b445db961a77785d77f93.r2.dev/Default/home-2.png"
          alt="home image"
        />
        puts your vocabulary to the test
        <img
          class="photo"
          src="https://pub-bf0bdbb9cd5b445db961a77785d77f93.r2.dev/Default/home-3.png"
          alt="home image"
        />
        with a fresh <span class="px-1 mark-highlight"> puzzle </span>
        <img
          class="photo"
          src="https://pub-bf0bdbb9cd5b445db961a77785d77f93.r2.dev/Default/home-4.png"
          alt="home image"
        />
        every day.
      </p>

      <p
        class="py-0.5 px-2 text-xs bg-(--aj-color-surface-hover) rounded-full select-none"
      >
        <RollingNumber :value="allSiteGameCount" /> games played
      </p>

      <RouterLink :to="{ name: 'wordle-setup' }" class="mt-24 mb-3 btn-primary">
        🎮 wordle →
      </RouterLink>

      <div class="flex flex-wrap gap-x-2">
        <p class="text-description -skew-x-12">Guess smart!</p>
        <p class="text-description -skew-x-12">Narrow it down!</p>
        <p class="text-description -skew-x-12">
          and crack the code before you run out of tries.
        </p>
      </div>
    </section>
  </DefaultLayout>
</template>

<style scoped>
@reference '@/assets/styles/style';

.text-description {
  @apply text-xs text-(--aj-color-subtle);
}
.text-flow {
  @apply leading-7 text-xl whitespace-normal;
}
.text-flow .photo {
  @apply inline-block mx-1 h-6 w-12 align-text-bottom rounded-md object-cover scale-100 rotate-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-180 hover:-rotate-6;
  &:nth-of-type(even) {
    @apply hover:rotate-3;
  }
}
</style>
