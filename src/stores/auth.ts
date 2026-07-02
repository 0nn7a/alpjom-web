import { defineStore } from 'pinia';
import type { LoginRequest, RegisterRequest, User } from '@/types/auth.ts';
import { computed, ref } from 'vue';
import { authService } from '@/services/auth.ts';
import { setAllTokens } from '@/utils/jwt.ts';
import { ApiError } from '@/types/common.ts';
import { useToastStore } from '@/stores/toast.ts';
import { USER_KEY } from '@/utils/constant.ts';
import { clearSession } from '@/services/session.ts';
import { useRoute, useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  // States
  const toastStore = useToastStore();
  const user = ref<User | null>(null);
  const router = useRouter();
  const route = useRoute();

  // Getters
  const isLoggedIn = computed(() => !!user.value);

  // Actions
  function initUser() {
    const u = localStorage.getItem(USER_KEY);
    if (u) {
      user.value = JSON.parse(u);
    }
  }

  function setUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    initUser();
  }

  function removeUser() {
    user.value = null;
  }

  function clearAuth() {
    clearSession();
    removeUser();
  }

  async function register(request: RegisterRequest) {
    await authService.register(request);
  }

  async function login(request: LoginRequest) {
    const res = await authService.login(request);
    setAllTokens(res.data);
    setUser(res.data.user);
  }

  async function logout() {
    try {
      await authService.logout();
      toastStore.notify('登出成功！', { tone: 'success' });
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(
          `登出時發生問題，但本地資料已清除，原錯誤訊息：${err.message}`,
          { tone: 'warning' }
        );
    } finally {
      clearAuth();
      if (route.meta.auth) await router.push({ name: 'login' });
    }
  }

  return { user, isLoggedIn, initUser, register, login, logout, clearAuth };
});
