import { defineStore } from 'pinia';
import { profileService } from '@/services/profile.ts';
import { ApiError } from '@/types/common.ts';
import { useToastStore } from '@/stores/toast.ts';
import type { Profile, UserAvatar, UserFollow } from '@/types/profile.ts';
import { computed, reactive, ref } from 'vue';
import {
  type FieldRule,
  PasswordPattern,
  UsernamePattern
} from '@/types/form.ts';
import { useAuthStore } from '@/stores/auth.ts';
import { useRoute, useRouter } from 'vue-router';
import type { PageRequest } from '@/types/page.ts';
import type { WordleRecord } from '@/types/wordle.ts';
import { gameService } from '@/services/game.ts';
import type { HeatmapRecord } from '@/types/heatmap.ts';

export const useProfileStore = defineStore('profile', () => {
  // 更新表單用的靜態資料
  type Form = {
    username: string;
    passwordOld: string;
    password: string;
  };
  const initialForm: Form = {
    username: '',
    passwordOld: '',
    password: ''
  };
  const fieldRules = {
    username: {
      required: false,
      pattern: UsernamePattern
    },
    passwordOld: {
      required: (form) => !!form.password,
      pattern: PasswordPattern
    },
    password: {
      required: false,
      pattern: PasswordPattern
    }
  } satisfies Record<keyof Form, FieldRule>;

  // States
  const toastStore = useToastStore();
  const authStore = useAuthStore();
  const route = useRoute();
  const router = useRouter();

  const username = ref<string>('');
  const pageRequest = ref<PageRequest>({ page: 1, size: 5 });
  const profile = ref<Profile | null>(null);

  const avatarUploaded = ref<UserAvatar[]>([]);
  const avatarSelected = ref<number[]>([]);

  const form = reactive<Form>({ ...initialForm });

  // Getters
  const avatar = computed(
    () =>
      profile.value?.avatar ??
      'https://pub-bf0bdbb9cd5b445db961a77785d77f93.r2.dev/Default/profile-avatar.png'
  );
  const isDailyDone = computed(() => profile.value?.isDailyDone ?? false);
  const follow = computed<UserFollow>(
    () =>
      profile.value?.follow ?? {
        followerCount: 0,
        followingCount: 0,
        following: false
      }
  );
  const totalDone = computed(() => profile.value?.totalDone ?? 0);
  const totalAchievements = computed(
    () => profile.value?.totalAchievements ?? 0
  );
  const joinTime = computed(() => profile.value?.createdAt ?? '');
  const heatmap = computed<HeatmapRecord[]>(() => profile.value?.heatmap ?? []);
  const totalPage = computed(() => profile.value?.recentGames.total ?? 0);
  const maxPage = computed(
    () => Math.ceil(totalPage.value / pageRequest.value.size) || 1
  );
  const recentGames = computed<WordleRecord[]>(
    () => profile.value?.recentGames.rows ?? []
  );

  const avatarCanDelete = computed(() => avatarSelected.value.length > 0);
  const avatarCanUpdate = computed(() => avatarSelected.value.length === 1);

  // Actions
  function clearProfile() {
    profile.value = null;
    pageRequest.value = { page: 1, size: 5 };
  }
  async function initProfile() {
    clearProfile();
    if (!username.value) return;

    try {
      const { data } = await profileService.profile(
        username.value,
        pageRequest.value
      );
      profile.value = data;
    } catch (err) {
      throw err;
    }
  }

  function clearAvatar() {
    avatarUploaded.value = [];
    avatarSelected.value = [];
  }
  async function getAvatar() {
    clearAvatar();

    try {
      const { data } = await profileService.getAvatar();
      avatarUploaded.value = data;
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
    }
  }
  async function uploadAvatar(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const { data } = await profileService.uploadAvatar(file);
      avatarUploaded.value.push(data);
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
    }
  }
  async function deleteAvatar() {
    if (!avatarCanDelete.value) {
      toastStore.notify('請至少選擇一張頭貼！', { tone: 'error' });
      return;
    }
    try {
      await profileService.deleteAvatar(avatarSelected.value);
      await getAvatar();
      toastStore.notify('頭貼已成功刪除！', { tone: 'success' });
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
    }
  }
  async function updateAvatar(close: () => void) {
    if (!avatarCanUpdate.value) {
      toastStore.notify('更新頭貼時僅能選中一張！', { tone: 'error' });
      return;
    }
    try {
      await profileService.updateUser({ avatarId: avatarSelected.value[0] });
      toastStore.notify('頭貼已成功更新！', { tone: 'success' });
      close();

      await initProfile();
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
    }
  }

  async function getFollower() {
    try {
      const { data } = await profileService.getFollower(username.value);
      return data;
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
      throw err;
    }
  }
  async function getFollowing() {
    try {
      const { data } = await profileService.getFollowing(username.value);
      return data;
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
      throw err;
    }
  }
  async function toggleFollow() {
    try {
      if (!authStore.isLoggedIn) {
        toastStore.notify('進行該操作前需先登入！', { tone: 'warning' });
        await router.push({
          name: 'login',
          query: { redirect: route.fullPath }
        });
        return;
      }
      const { data } = await profileService.toggleFollow(username.value);
      if (profile.value) {
        profile.value = { ...profile.value, follow: data };
      }
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
    }
  }

  function clearForm() {
    Object.assign(form, initialForm);
  }
  async function updateForm() {
    try {
      await profileService.updateUser({ username: form.username });
    } catch (err) {
      throw err;
    }
  }

  async function updatePassword() {
    try {
      await profileService.updatePassword({
        passwordOld: form.passwordOld,
        password: form.password
      });
    } catch (err) {
      throw err;
    }
  }

  async function flipRecentGame() {
    try {
      const { data } = await gameService.recordFinished(
        username.value,
        pageRequest.value
      );
      if (profile.value) {
        profile.value.recentGames = data;
      }
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
    }
  }

  function reset() {
    clearProfile();
    clearAvatar();
    clearForm();
  }

  return {
    fieldRules,

    // States
    username,
    pageRequest,
    avatarUploaded,
    avatarSelected,
    form,

    // Getters
    avatar,
    isDailyDone,
    follow,
    totalDone,
    totalAchievements,
    joinTime,
    heatmap,
    maxPage,
    recentGames,
    avatarCanDelete,
    avatarCanUpdate,

    // Actions
    initProfile,
    getAvatar,
    uploadAvatar,
    deleteAvatar,
    updateAvatar,
    getFollower,
    getFollowing,
    toggleFollow,
    clearForm,
    updateForm,
    updatePassword,
    flipRecentGame,
    reset
  };
});
