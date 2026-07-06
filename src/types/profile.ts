import type { HeatmapRecord } from '@/types/heatmap.ts';

export interface Profile {
  id: number; // user id
  username: string;
  avatar: string | null;
  createdAt: string;
  follow: UserFollow;
  isDailyDone: boolean;
  totalDone: number;
  totalAchievements: number;
  heatmap: HeatmapRecord[];
}

// 用戶頭貼記錄
export interface UserAvatar {
  id: number;
  userId: number;
  fileUrl: string;
  createdAt: string;
}

// 用戶追蹤關係
export interface UserFollow {
  followerCount: number; // 粉絲總數
  followingCount: number; // 追蹤中總數
  following: boolean; // 登入用戶是否已追蹤當前查看用戶
}

// 修改用戶基本資料
export interface UpdateUserRequest {
  username?: string;
  avatarId?: number;
}

// 修改密碼
export interface UpdatePasswordRequest {
  passwordOld: string;
  password: string;
}
