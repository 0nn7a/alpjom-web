import type { ApiResponse } from '@/types/common.ts';
import { api } from '@/services/api.ts';
import { API } from '@/utils/constant.ts';
import type {
  WordleBeforeDailyResponse,
  WordleCommentRequest,
  WordleGameResponse,
  WordleGuessRequest,
  WordleGuessResponse,
  WordleLike,
  WordleOngoing,
  WordleShareResponse,
  WordleStartRequest,
  WordleStartResponse
} from '@/types/wordle.ts';
import type { WordleDifficulty } from '@/utils/wordle.ts';

export const wordleService = {
  start: (
    data: WordleStartRequest
  ): Promise<ApiResponse<WordleStartResponse>> =>
    api.post(API.WORDLE.START, data),
  guess: (
    data: WordleGuessRequest
  ): Promise<ApiResponse<WordleGuessResponse>> =>
    api.post(API.WORDLE.GUESS, data),
  game: (recordId: Number): Promise<ApiResponse<WordleGameResponse>> =>
    api.get(`${API.WORDLE.GAME}/${recordId}`),
  share: (shareToken: string): Promise<ApiResponse<WordleShareResponse>> =>
    api.get(`${API.WORDLE.SHARE}/${shareToken}`),
  toggleLike: (shareToken: string): Promise<ApiResponse<WordleLike>> =>
    api.post(`${API.WORDLE.LIKE}/${shareToken}`),
  insertComment: (data: WordleCommentRequest): Promise<ApiResponse<void>> =>
    api.post(API.WORDLE.COMMENT, data),
  deleteComment: (id: number): Promise<ApiResponse<void>> =>
    api.delete(`${API.WORDLE.COMMENT}/${id}`),
  beforeDaily: (
    date: string
  ): Promise<ApiResponse<WordleBeforeDailyResponse>> =>
    api.get(API.WORDLE.BEFORE.DAILY, { date }),
  beforePractice: (
    difficulty: WordleDifficulty
  ): Promise<ApiResponse<WordleOngoing[]>> =>
    api.get(API.WORDLE.BEFORE.PRACTICE, { difficulty })
};
