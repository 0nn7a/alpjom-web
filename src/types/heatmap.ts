export interface HeatmapRecord {
  /** 日期，格式 'YYYY-MM-DD' */
  date: string; //
  /** 當天完成的遊戲局數 */
  count: number;
}

/** 色階 0–4，對應局數區間 */
export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

/** 內部使用的每日資料（已補齊所有日期） */
export interface HeatmapCell {
  date: string;
  count: number;
  level: HeatmapLevel;
  isFuture: boolean;
}
