import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import { getToken } from '@/utils/jwt.ts';
import { clearSession, refreshAccessToken } from '@/services/session';
import { useToastStore } from '@/stores/toast.ts';
import { ApiError } from '@/types/common.ts';
import { useAuthStore } from '@/stores/auth.ts';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/EmptyLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/HomePage.vue'),
        meta: { auth: true }
      },
      {
        path: 'profile',
        children: [
          {
            path: ':username',
            name: 'profile',
            component: () => import('@/pages/ProfilePage.vue'),
            meta: { auth: false }
          }
        ]
      },
      {
        path: 'ranking',
        name: 'ranking',
        component: () => import('@/pages/ComingSoon.vue'),
        meta: { auth: false }
      },
      {
        path: 'wordle',
        children: [
          {
            path: '',
            name: 'wordle-setup',
            component: () => import('@/pages/WordleSetup.vue'),
            meta: { auth: true }
          },
          {
            path: 'game/:recordId',
            name: 'wordle-game',
            component: () => import('@/pages/WordleGame.vue'),
            meta: { auth: true }
          },
          {
            path: 'share/:shareToken',
            name: 'wordle-share',
            component: () => import('@/pages/WordleShare.vue'),
            meta: { auth: false }
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/AuthPage.vue'),
    meta: { auth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/AuthPage.vue'),
    meta: { auth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'home' }
  }
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
});

// 全域守衛：驗證登入狀態
router.beforeEach(async (to) => {
  // 驗證身分及路由放行
  const requiresAuth = to.matched.some((route) => route.meta.auth);
  const isAuthPage = to.name === 'login' || to.name === 'register';
  const token = getToken();

  const toastStore = useToastStore();
  const authStore = useAuthStore();

  if (isAuthPage) {
    try {
      if (!token) await refreshAccessToken();

      const redirect = to.query.redirect;
      if (typeof redirect === 'string') return redirect;

      return { name: 'home' };
    } catch {
      // 切換路由引起的自動換發失敗，清除 Token 並允許前往登入註冊頁
      clearSession();
    }

    return true;
  }

  if (!requiresAuth) return true;
  if (token) return true;

  try {
    await refreshAccessToken();
    return true;
  } catch (err) {
    // 切換路由引起的自動換發失敗，清除 Token 並導向至重新登入
    authStore.clearAuth();
    if (err instanceof ApiError)
      toastStore.notify(err.message, { tone: 'error' });
  }

  return {
    name: 'login',
    query: { redirect: to.fullPath }
  };
});

export default router;
