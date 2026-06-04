import type { ApiResponse } from '@/types/common.ts';
import { api } from '@/services/api.ts';
import { API } from '@/utils/constant.ts';
import type {
  WordleGameResponse,
  WordleGuessRequest,
  WordleGuessResponse,
  WordleStartRequest,
  WordleStartResponse
} from '@/types/wordle.ts';

export const wordleService = {
  start: (
    data: WordleStartRequest
  ): Promise<ApiResponse<WordleStartResponse>> =>
    api.post(API.WORDLE.START, data),
  guess: (
    data: WordleGuessRequest
  ): Promise<ApiResponse<WordleGuessResponse>> =>
    api.post(API.WORDLE.GUESS, data),
  game: (gameId: Number): Promise<ApiResponse<WordleGameResponse>> =>
    api.get(`${API.WORDLE.GAME}/${gameId}`)
};
