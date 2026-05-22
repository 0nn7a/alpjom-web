import { getRefreshToken, getToken } from '@/utils/jwt';
import { ApiError, type ApiResponse } from '@/types/common';

const BASE_URL = import.meta.env.VITE_API_URL;

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

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  const refreshToken = getRefreshToken();

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (refreshToken) headers['X-Refresh-Token'] = refreshToken;

  return headers;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' })
};
