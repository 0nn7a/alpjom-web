import type { RegisterRequest } from '@/types/auth.ts';
import type { ApiResponse } from '@/types/common.ts';
import { api } from '@/services/api.ts';
import { API } from '@/utils/constant.ts';

export const wordleService = {
  start: (data: RegisterRequest): Promise<ApiResponse<void>> =>
    api.post(API.WORDLE.START, data),
  guess: (data: RegisterRequest): Promise<ApiResponse<void>> =>
    api.post(API.WORDLE.GUESS, data),
  game: (gameId: Number): Promise<ApiResponse<void>> =>
    api.get(`${API.WORDLE.GAME}/${gameId}`)
};
