import { api } from '@/services/api.ts';
import { API } from '@/utils/constant.ts';
import type { ApiResponse } from '@/types/common.ts';

export const gameService = {
  countFinished: (): Promise<ApiResponse<number>> =>
    api.get(API.GAME.COUNT.FINISHED)
};
