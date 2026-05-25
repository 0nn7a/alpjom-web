import {
  getRefreshToken,
  getToken,
  removeAllTokens,
  setToken
} from '@/utils/jwt';
import { ApiError, type ApiResponse } from '@/types/common';
import type { RefreshResponse } from '@/types/auth.ts';
import router from '@/router';
import { API } from '@/utils/constant.ts';

const BASE_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  const refreshToken = getRefreshToken();

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (refreshToken) headers['X-Refresh-Token'] = refreshToken;

  return headers;
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options?.headers
      }
    });

    const data: ApiResponse<T> = await res.json();
    if (!res.ok) throw new ApiError(data);

    return data;
  } catch (err) {
    if (err instanceof TypeError) {
      throw new ApiError({
        code: 0,
        message: '網路連線異常，請稍後再試！',
        data: null
      });
    }

    // 已經是 ApiError 就直接往上拋，不需要再包一層
    if (err instanceof ApiError) throw err;

    // 其他預期外的錯誤
    throw new ApiError({
      code: 500,
      message: '未知錯誤，請聯繫系統管理員！',
      data: null
    });
  }
}

const SKIP_REFRESH_PATHS = [
  API.AUTH.LOGIN,
  API.AUTH.REGISTER,
  API.AUTH.LOGOUT,
  API.AUTH.REGISTER
];
let isRefreshing = false;
let pendingRequests: (() => void)[] = [];

async function requestWithRetry<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    return await request<T>(path, options);
  } catch (err) {
    if (
      !(err instanceof ApiError) ||
      err.code !== 401 ||
      SKIP_REFRESH_PATHS.includes(path)
    ) {
      throw err;
    }

    // 如果令牌正在換發中，將當前請求排隊等待
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push(async () => {
          try {
            resolve(await request<T>(path, options));
          } catch (e) {
            reject(e);
          }
        });
      });
    }

    // 換發令牌
    isRefreshing = true;
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new ApiError({ code: 401, message: '請重新登入！', data: null });
      }

      const res = await request<RefreshResponse>('/auth/refresh', {
        method: 'POST',
        headers: { 'X-Refresh-Token': refreshToken }
      });

      // 換發成功，更新 token
      setToken(res.data.token, res.data.expiredAt);

      // 重新開始執行排隊等待中的請求
      pendingRequests.forEach((cb) => cb());
      pendingRequests = [];

      // 重試原本的請求
      return await request<T>(path, options);
    } catch (e) {
      // 換發失敗，清除 Token 並導向登入頁
      pendingRequests = [];
      removeAllTokens();
      await router.push({ name: 'login' });
      throw e;
    } finally {
      isRefreshing = false;
    }
  }
}

export const api = {
  get: <T>(path: string) => requestWithRetry<T>(path),
  post: <T>(path: string, body: unknown) =>
    requestWithRetry<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    requestWithRetry<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => requestWithRetry<T>(path, { method: 'DELETE' })
};
