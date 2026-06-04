import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import { getToken } from '@/utils/jwt.ts';
import { clearSession, refreshAccessToken } from '@/services/session';
import { useToastStore } from '@/stores/toast.ts';
import { ApiError } from '@/types/common.ts';
import {
  ROUTE_NAME_WORDLE_GAME,
  ROUTE_PATH_WORDLE_GAME,
  getWordleGameRedirectRoute
} from '@/router/wordle.ts';

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
        path: 'color',
        name: 'color',
        component: () => import('@/pages/ColorPage.vue'),
        meta: { auth: false }
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            name: 'profile',
            component: () => import('@/pages/ProfilePage.vue'),
            meta: { auth: true }
          }
        ]
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
            path: ROUTE_PATH_WORDLE_GAME,
            name: ROUTE_NAME_WORDLE_GAME,
            component: () => import('@/pages/WordleGame.vue'),
            meta: { auth: true }
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/AuthPage.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/AuthPage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'home', params: {} }
  }
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
});

// 全域守衛：驗證登入狀態
router.beforeEach(async (to) => {
  // 阻止用戶進入不合法的 wordle 遊戲
  const wordleGuardRedirect = getWordleGameRedirectRoute(to);
  if (wordleGuardRedirect) return wordleGuardRedirect;

  // 驗證身分及路由放行
  const requiresAuth = to.matched.some((route) => route.meta.auth);
  const isAuthPage = to.name === 'login' || to.name === 'register';
  const token = getToken();
  const toastStore = useToastStore();

  if (isAuthPage) {
    if (token) return { name: 'home' };

    try {
      await refreshAccessToken();
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
    clearSession();
    if (err instanceof ApiError)
      toastStore.notify(err.message, { tone: 'error' });
  }

  return {
    name: 'login',
    query: { redirect: to.fullPath }
  };
});

export default router;
