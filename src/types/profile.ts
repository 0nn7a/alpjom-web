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
