import { defineStore } from 'pinia';
import type { LoginRequest, RegisterRequest, User } from '@/types/auth.ts';
import { ref } from 'vue';
import { authService } from '@/services/auth.ts';
import { removeAllTokens, setAllTokens } from '@/utils/jwt.ts';

export const useAuthStore = defineStore('auth', () => {
  // States
  const user = ref<User | null>(null);

  // Getters

  // Methods
  async function register(request: RegisterRequest) {
    await authService.register(request);
  }

  async function login(request: LoginRequest) {
    const res = await authService.login(request);
    setAllTokens(res.data);
    user.value = res.data.user;
  }

  async function logout() {
    await authService.logout();
    removeAllTokens();
    user.value = null;
  }

  return { register, login, logout };
});
