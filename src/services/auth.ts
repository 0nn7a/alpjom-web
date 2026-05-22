import { API } from '@/utils/constant.ts';
import { api } from '@/services/api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest
} from '@/types/auth.ts';
import type { ApiResponse } from '@/types/common.ts';

export const authService = {
  register: (data: RegisterRequest): Promise<ApiResponse<void>> =>
    api.post(API.AUTH.REGISTER, data),

  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
    api.post(API.AUTH.LOGIN, data),

  logout: (): Promise<ApiResponse<void>> => api.post(API.AUTH.LOGOUT, null)
};
