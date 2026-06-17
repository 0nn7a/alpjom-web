import { getRefreshToken, getToken } from '@/utils/jwt';
import { ApiError, type ApiResponse } from '@/types/common';
import { API } from '@/utils/constant.ts';
import router from '@/router';
import { clearSession, refreshAccessToken } from '@/services/session';

const BASE_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  const refreshToken = getRefreshToken();

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (refreshToken) headers['X-Refresh-Token'] = refreshToken;

  return headers;
}

// 只有非 FormData 才加 Content-Type
function getContentType(options?: RequestInit): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
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
        ...getContentType(options),
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
  API.AUTH.REFRESH
];

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

    try {
      await refreshAccessToken();
      return await request<T>(path, options);
    } catch (e) {
      // 請求失敗引起的自動換發失敗，清除 Token 並導向登入頁
      clearSession();
      await router.push({ name: 'login' });
      throw e;
    }
  }
}

function withBody<T>(method: string, path: string, body?: unknown) {
  return requestWithRetry<T>(path, {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
}

export const api = {
  get: <T>(
    path: string,
    params?: Record<string, string | number | boolean>
  ) => {
    const query = params
      ? '?' +
        new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        ).toString()
      : '';
    return requestWithRetry<T>(path + query);
  },
  post: <T>(path: string, body?: unknown) => withBody<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => withBody<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => withBody<T>('PATCH', path, body),
  delete: <T>(path: string, body?: unknown) =>
    withBody<T>('DELETE', path, body),
  upload: <T>(path: string, formData: FormData) =>
    requestWithRetry<T>(path, { method: 'POST', body: formData })
};
