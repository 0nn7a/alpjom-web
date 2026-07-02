import type { WordleDifficulty, WordleMode } from '@/utils/wordle.ts';

// 開始遊戲
export interface WordleStartRequest {
  mode: WordleMode;
  difficulty: WordleDifficulty;
  date: string; // YYYY-MM-DD
}
export interface WordleStartResponse {
  gameId: number;
  maxGuesses: number; // 0 -> 無限
}

// 猜題結果
export type LetterResult = 'G' | 'Y' | 'W'; // 標記每個字符的狀況：G全對｜Y位置錯｜W不存在
export interface WordleGuess {
  guessWord: string;
  result: string; // 將會是由 LetterResult 字符組成的字串，例如 "GYWWG"
}

// 送出猜題
export interface WordleGuessRequest {
  gameId: number;
  guessWord: string;
}
export interface WordleGuessResponse {
  guess: WordleGuess;
  isWin: boolean; // 1/0 -> true/false, null -> ing
  answer: string; // 只在遊戲結束後回傳，避免失敗後不知道答案
  shareToken: string; // 只在遊戲結束後回傳，能順手導向至分享頁
}

// 整局遊戲資料
export interface WordleGameResponse {
  gameId: number;
  mode: WordleMode;
  difficulty: WordleDifficulty;
  maxGuesses: number;
  isWin: boolean;
  date: string;
  answer: string;
  shareToken: string;
  guesses: WordleGuess[]; // 該局遊戲所有猜測紀錄，依 createdAt 排序
}

// 分享遊戲 like 資料
export interface WordleLike {
  count: number;
  byMe: boolean;
}

// 分享遊戲留言區
export interface WordleCommentRequest {
  shareToken: string;
  content: string;
}
export interface WordleComment {
  id: number;
  username: string;
  avatar: string;
  content: string;
  createdAt: string;
}

// 分享遊戲資料
export interface WordleShareResponse {
  username: string;
  avatar: string;
  mode: WordleMode;
  difficulty: WordleDifficulty;
  maxGuesses: number;
  isWin: boolean;
  guesses: WordleGuess[];
  like: WordleLike;
  comments: WordleComment[];
}

// 每日模式開始前檢查
export interface WordleBeforeDailyResponse {
  gameId: number;
  isWin: boolean;
  shareToken: string;
}

// 展示進行中遊戲詳細資料
export interface WordleOngoing {
  gameId: number;
  mode: WordleMode;
  difficulty: WordleDifficulty;
  maxGuesses: number;
  currentGuesses: number;
  createdAt: string;
}
