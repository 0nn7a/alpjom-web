import { defineStore } from 'pinia';
import { profileService } from '@/services/profile.ts';
import { ApiError } from '@/types/common.ts';
import { useToastStore } from '@/stores/toast.ts';
import type { Profile } from '@/types/profile.ts';
import { computed, ref } from 'vue';

export const useProfileStore = defineStore('profile', () => {
  // States
  const toastStore = useToastStore();
  const profile = ref<Profile | null>(null);

  // Getters
  const avatar = computed(
    () =>
      profile.value?.avatar ??
      'https://pub-bf0bdbb9cd5b445db961a77785d77f93.r2.dev/Default/profile-avatar.png'
  );
  const isDailyDone = computed(() => profile.value?.isDailyDone ?? false);
  const totalDone = computed(() => profile.value?.totalDone ?? 0);
  const totalAchievements = computed(
    () => profile.value?.totalAchievements ?? 0
  );
  const joinTime = computed(() => profile.value?.createdAt ?? '');
  const heatmap = computed(() => profile.value?.heatmap ?? []);

  // Actions
  function clearProfile() {
    profile.value = null;
  }
  async function initProfile(username: string) {
    clearProfile();

    try {
      const { data } = await profileService.profile(username);
      profile.value = data;
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message + '將自動導向回首頁。', {
          tone: 'error'
        });
      throw err;
    }
  }

  return {
    avatar,
    isDailyDone,
    totalDone,
    totalAchievements,
    joinTime,
    heatmap,
    initProfile
  };
});
