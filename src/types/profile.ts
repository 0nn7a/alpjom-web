import type { HeatmapRecord } from '@/types/heatmap.ts';

export interface Profile {
  id: number; // user id
  username: string;
  avatar: string | null;
  createdAt: string;
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

// 修改用戶基本資料
export interface UpdateProfileRequest {
  username?: string;
  avatarId?: number;
}

// 修改密碼（通常需要驗證舊密碼）
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
