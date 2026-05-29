import { API } from '@/utils/constant';
import { getRefreshToken, removeAllTokens, setToken } from '@/utils/jwt';
import { ApiError, type ApiResponse } from '@/types/common';
import type { RefreshResponse } from '@/types/auth';

const BASE_URL = import.meta.env.VITE_API_URL;

let refreshPromise: Promise<void> | null = null;

async function refreshTokenRequest(): Promise<void> {
  const refreshToken = getRefreshToken();
  console.log(111);

  if (!refreshToken) {
    throw new ApiError({ code: 401, message: '請重新登入！', data: null });
  }

  try {
    const res = await fetch(`${BASE_URL}${API.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Refresh-Token': refreshToken
      }
    });

    const data: ApiResponse<RefreshResponse> = await res.json();
    if (!res.ok) throw new ApiError(data);

    setToken(data.data.token, data.data.expiredAt);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new ApiError({
        code: 0,
        message: '網路連線異常，請稍後再試！',
        data: null
      });
    }

    if (err instanceof ApiError) throw err;

    throw new ApiError({
      code: 500,
      message: '未知錯誤，請聯繫系統管理員！',
      data: null
    });
  }
}

export async function refreshAccessToken(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = refreshTokenRequest().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export function clearSession(): void {
  removeAllTokens();
}
