import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/utils/constant';
import type { LoginResponse } from '@/types/auth.ts';

export function getToken(): string | undefined {
  const value = `; ${document.cookie}`;
  const parts: string[] = value.split(`; ${TOKEN_KEY}=`);

  if (parts.length !== 2) return undefined;

  return parts.pop()?.split(';').shift();
}

export function getRefreshToken(): string | undefined {
  const value = `; ${document.cookie}`;
  const parts: string[] = value.split(`; ${REFRESH_TOKEN_KEY}=`);

  if (parts.length !== 2) return undefined;

  return parts.pop()?.split(';').shift();
}

export function setToken(token: string, expired: string | number | Date): void {
  document.cookie = `${TOKEN_KEY}=${token}; expires=${new Date(
    expired
  ).toUTCString()}; path=/`;
}

export function setRefreshToken(
  token: string,
  expired: string | number | Date
): void {
  document.cookie = `${REFRESH_TOKEN_KEY}=${token}; expires=${new Date(
    expired
  ).toUTCString()}; path=/`;
}

export function setAllTokens(res: LoginResponse): void {
  const { token, refreshToken, expiredAt, refreshExpiredAt } = res;
  setToken(token, expiredAt);
  setRefreshToken(refreshToken, refreshExpiredAt);
}

export function removeToken(): void {
  document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

export function removeRefreshToken(): void {
  document.cookie = `${REFRESH_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

export function removeAllTokens(): void {
  removeToken();
  removeRefreshToken();
}
