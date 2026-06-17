import { defineStore } from 'pinia';
import { profileService } from '@/services/profile.ts';
import { ApiError } from '@/types/common.ts';
import { useToastStore } from '@/stores/toast.ts';
import type {
  Profile,
  UpdateProfileRequest,
  UserAvatar
} from '@/types/profile.ts';
import { computed, reactive, ref } from 'vue';
import {
  type FieldRule,
  PasswordPattern,
  UsernamePattern
} from '@/types/form.ts';
import { useAuthStore } from '@/stores/auth.ts';

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

  const username = ref<string>('');
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
  const totalDone = computed(() => profile.value?.totalDone ?? 0);
  const totalAchievements = computed(
    () => profile.value?.totalAchievements ?? 0
  );
  const joinTime = computed(() => profile.value?.createdAt ?? '');
  const heatmap = computed(() => profile.value?.heatmap ?? []);

  const avatarCanDelete = computed(() => avatarSelected.value.length > 0);
  const avatarCanUpdate = computed(() => avatarSelected.value.length === 1);

  // Actions
  function clearProfile() {
    profile.value = null;
  }
  async function initProfile() {
    clearProfile();
    if (!username.value) return;

    try {
      const { data } = await profileService.profile(username.value);
      profile.value = data;
    } catch (err) {
      throw err;
    }
  }

  async function updateProfile(data: UpdateProfileRequest) {
    try {
      await profileService.updateProfile(data);
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
    }
  }

  async function getAvatar() {
    avatarUploaded.value = [];
    avatarSelected.value = [];

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
      await updateProfile({ avatarId: avatarSelected.value[0] });
      toastStore.notify('頭貼已成功更新！', { tone: 'success' });
      close();

      await initProfile();
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
    }
  }

  function resetForm() {
    Object.assign(form, initialForm);
  }
  async function updateForm(close: () => void) {
    if (!form.username) {
      toastStore.notify('使用者資料無變更！', { tone: 'info' });
      close();
      return;
    }

    try {
      await updateProfile({ username: form.username });
      toastStore.notify('用戶名已成功更新！', { tone: 'success' });
      close();

      await authStore.logout();
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
    }
  }

  return {
    fieldRules,

    // States
    username,
    avatarUploaded,
    avatarSelected,
    form,

    // Getters
    avatar,
    isDailyDone,
    totalDone,
    totalAchievements,
    joinTime,
    heatmap,
    avatarCanDelete,
    avatarCanUpdate,

    // Actions
    initProfile,
    updateProfile,
    getAvatar,
    uploadAvatar,
    deleteAvatar,
    updateAvatar,
    resetForm,
    updateForm
  };
});
