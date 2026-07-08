import { api } from '@/services/api.ts';
import { API } from '@/utils/constant.ts';
import type { ApiResponse } from '@/types/common.ts';
import type { PageRequest, PageResponse } from '@/types/page.ts';
import type { WordleRecord } from '@/types/wordle.ts';

export const gameService = {
  countFinished: (): Promise<ApiResponse<number>> =>
    api.get(API.GAME.COUNT.FINISHED),
  recordFinished: (
    username: string,
    pageRequest: PageRequest
  ): Promise<ApiResponse<PageResponse<WordleRecord>>> =>
    api.get(`${API.GAME.RECORD.FINISHED}/${username}`, {
      page: pageRequest.page,
      size: pageRequest.size
    })
};
