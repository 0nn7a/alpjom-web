import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { getToken } from '@/utils/jwt.ts';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/HomePage.vue'),
        meta: { auth: true }
      }
    ]
  },
  {
    path: '/profile',
    component: () => import('@/layouts/ProfileLayout.vue'),
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
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
});

// 全域守衛：驗證登入狀態
router.beforeEach((to) => {
  const requiresAuth = to.matched.some((route) => route.meta.auth);
  const isAuthPage = to.name === 'login' || to.name === 'register';
  const token = getToken();

  if (isAuthPage && token) return { name: 'home' };
  if (!requiresAuth || token) return true;

  return {
    name: 'login',
    query: { redirect: to.fullPath }
  };
});

export default router;
