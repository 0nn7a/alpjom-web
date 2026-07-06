<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useTooltipStore } from '@/stores/tooltip';
import type { HeatmapRecord, HeatmapCell, HeatmapLevel } from '@/types/heatmap';
import { toTaiwanDateStr } from '@/utils/common.ts';

const tooltipStore = useTooltipStore();

// ─── Props ───────────────────────────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    /** 玩家每日完成局數紀錄 */
    records: HeatmapRecord[];
    /** 是否顯示下方統計欄 */
    showStats?: boolean;
  }>(),
  {
    showStats: true
  }
);

// ─── Emits ───────────────────────────────────────────────────────────────────
const emit = defineEmits<{
  /** 點擊某天時觸發 */
  'day-click': [cell: HeatmapCell];
}>();

// ─── Data ────────────────────────────────────────────────────────────────────
/** 固定顯示 53 欄（週）× 7 列（天）*/
const totalWeeks = 53;

/** 結束日：今天 */
const today = toTaiwanDateStr(new Date());

/** 開始日：往前推 52 週，再對齊到當週週日 */
const startDate = (() => {
  const start = new Date();
  start.setDate(start.getDate() - 52 * 7);
  start.setDate(start.getDate() - start.getDay());
  return start;
})();

/** records 轉 Map，方便 O(1) 查找 */
const recordMap = computed(() => {
  const map = new Map<string, number>();
  for (const r of props.records) {
    map.set(r.date, r.count);
  }
  return map;
});

/**
 * weeks：二維陣列 weeks[weekIndex][dayIndex]
 * weekIndex 0 = 最早的一週，weekIndex 52 = 最近的一週
 * dayIndex 0 = 週日，dayIndex 6 = 週六
 */
const weeks = computed<HeatmapCell[][]>(() => {
  const result: HeatmapCell[][] = [];
  const cursor = new Date(startDate);

  for (let w = 0; w < totalWeeks; w++) {
    const week: HeatmapCell[] = [];
    for (let d = 0; d < 7; d++) {
      // 用本地日期字串比較，避免 toISOString() 的 UTC 時區偏移問題
      const dateStr = toTaiwanDateStr(cursor);
      const isFuture = dateStr > today;
      const count = isFuture ? 0 : (recordMap.value.get(dateStr) ?? 0);
      week.push({
        date: dateStr,
        count,
        level: isFuture ? 0 : toLevel(count),
        isFuture
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    result.push(week);
  }
  return result;
});

/** 月標籤（只在該週是某月第一次出現時才顯示）*/
/** 月標籤至少需要間隔幾週才顯示，避免文字重疊（可依實際字寬微調） */
const MIN_LABEL_GAP = 2;

const monthLabels = computed<(string | null)[]>(() => {
  const MONTHS = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月'
  ];

  // 1. 先收集每個月第一次出現的 weekIndex
  const monthStarts: { weekIndex: number; label: string }[] = [];
  const seen = new Set<string>();

  weeks.value.forEach((week, wi) => {
    const yearMonth = week[0].date.slice(0, 7); // '2025-06'
    if (!seen.has(yearMonth)) {
      seen.add(yearMonth);
      const month = parseInt(week[0].date.slice(5, 7)) - 1;
      monthStarts.push({ weekIndex: wi, label: MONTHS[month] });
    }
  });

  // 2. 若跟「下一個月」的間距小於門檻，就跳過目前這個標籤
  //    （優先保留比較新、欄位資訊更完整的月份）
  const filtered = monthStarts.filter((cur, idx) => {
    const next = monthStarts[idx + 1];
    if (!next) return true; // 最後一個月沒有比較對象，一定保留
    return next.weekIndex - cur.weekIndex >= MIN_LABEL_GAP;
  });

  // 3. 還原成跟 weeks 等長的陣列
  const labels: (string | null)[] = new Array(weeks.value.length).fill(null);
  filtered.forEach(({ weekIndex, label }) => {
    labels[weekIndex] = label;
  });
  return labels;
});

/** 日標籤（只顯示一/三/五，其餘留空佔位）*/
const DAY_LABELS = ['', '一', '', '三', '', '五', ''] as const;

// ─── 統計數量 ───────────────────────────────────────────────────────────────
const stats = computed(() => {
  let totalActive = 0;
  let maxCount = 0;
  let streak = 0;
  let bestStreak = 0;

  for (const week of weeks.value) {
    for (const cell of week) {
      if (cell.isFuture) continue;
      if (cell.count > 0) {
        totalActive++;
        streak++;
        bestStreak = Math.max(bestStreak, streak);
      } else {
        streak = 0;
      }
      maxCount = Math.max(maxCount, cell.count);
    }
  }
  return { totalActive, maxCount, bestStreak };
});

const formattedStats = computed(() => [
  { value: stats.value.totalActive, label: '活躍天數' },
  { value: stats.value.bestStreak, label: '最長連續天' },
  { value: stats.value.maxCount, label: '單日最高局數' }
]);

// ─── Utils ───────────────────────────────────────────────────────────────────
/**
 * 局數 → 色階對應
 * 0 局   → 0（空白）
 * 1–2 局 → 1
 * 3–4 局 → 2
 * 5–7 局 → 3
 * 8+ 局  → 4
 */
function toLevel(count: number): HeatmapLevel {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 7) return 3;
  return 4;
}

// ─── 格線顏色 class ───────────────────────────────────────────────────────────
function cellClass(cell: HeatmapCell): string {
  if (cell.isFuture) return 'cell--future';
  return `cell--level-${cell.level}`;
}

// ── 自動滾動到最近月份 ──────────────────────────────────────────────────────────
const scrollDom = ref<HTMLElement | null>(null);
async function scrollToEnd() {
  await nextTick(); // 等 DOM 更新完，新內容算進 scrollHeight
  const el = scrollDom.value;
  if (el) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
}
onMounted(() => {
  scrollToEnd();
});
</script>

<template>
  <div class="heatmap">
    <div class="heatmap__cols">
      <!-- 左側日標籤 -->
      <div class="heatmap__day-labels">
        <span
          v-for="(label, i) in DAY_LABELS"
          :key="i"
          class="heatmap__day-label"
        >
          {{ label }}
        </span>
      </div>

      <!-- 橫向捲動容器 -->
      <div class="heatmap__scroll" ref="scrollDom">
        <div class="heatmap__rows">
          <!-- 月份標籤列 -->
          <div class="heatmap__months">
            <div
              v-for="(label, wi) in monthLabels"
              :key="wi"
              class="heatmap__month-cell"
            >
              <span v-if="label" class="heatmap__month-label">{{ label }}</span>
            </div>
          </div>

          <!-- 週欄 -->
          <div class="heatmap__weeks">
            <div v-for="(week, wi) in weeks" :key="wi" class="heatmap__week">
              <button
                v-for="cell in week"
                :key="cell.date"
                class="heatmap__cell"
                :class="cellClass(cell)"
                :aria-label="`${cell.date}，完成 ${cell.count} 局`"
                :disabled="cell.isFuture"
                @mouseenter="tooltipStore.show($event, cell)"
                @mouseleave="tooltipStore.hide"
                @click="emit('day-click', cell)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 圖例 -->
    <div class="heatmap__legend">
      <span class="heatmap__legend-label">0</span>
      <div
        v-for="level in [0, 1, 2, 3, 4]"
        :key="level"
        class="heatmap__legend-cell"
        :class="`cell--level-${level}`"
      />
      <span class="heatmap__legend-label">8+</span>
    </div>

    <!-- 統計欄 -->
    <div v-if="showStats" class="heatmap__stats">
      <template v-for="(stat, idx) in formattedStats" :key="stat.label">
        <span v-if="idx !== 0" class="divide-vertical" />
        <div class="heatmap__stat">
          <span class="heatmap__stat-label">{{ stat.label }}</span>
          <span class="heatmap__stat-value">{{ stat.value }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
@reference '@/assets/styles/style';

.cell--level-0 {
  --cell-bg: var(--color-neutral-100);
}
.cell--level-1 {
  --cell-bg: var(--color-neutral-300);
}
.cell--level-2 {
  --cell-bg: var(--color-neutral-400);
}
.cell--level-3 {
  --cell-bg: var(--color-neutral-600);
}
.cell--level-4 {
  --cell-bg: var(--color-neutral-800);
}
.cell--future {
  --cell-bg: var(--color-neutral-100);
}

html[data-theme='dark'] .cell--level-0 {
  --cell-bg: var(--color-neutral-800);
}
html[data-theme='dark'] .cell--level-1 {
  --cell-bg: var(--color-neutral-600);
}
html[data-theme='dark'] .cell--level-2 {
  --cell-bg: var(--color-neutral-500);
}
html[data-theme='dark'] .cell--level-3 {
  --cell-bg: var(--color-neutral-400);
}
html[data-theme='dark'] .cell--level-4 {
  --cell-bg: var(--color-neutral-200);
}
html[data-theme='dark'] .cell--future {
  --cell-bg: var(--color-neutral-800);
}

.heatmap {
  --cell-size: 0.8rem;
  --cell-gap: 0.16rem;
  @apply flex flex-col gap-3 select-none;
}

.heatmap__cols {
  @apply flex gap-1;
}

.heatmap__day-labels {
  @apply shrink-0 self-end flex flex-col items-end gap-(--cell-gap);
}
.heatmap__day-label {
  @apply h-(--cell-size) leading-(--cell-size) text-xs text-(--aj-color-muted) text-right;
}

.heatmap__scroll {
  @apply overflow-x-auto overflow-y-visible;
}

.heatmap__rows {
  @apply flex flex-col gap-1;
}

.heatmap__months {
  @apply flex gap-(--cell-gap);
}
.heatmap__month-cell {
  @apply shrink-0 relative h-4 w-(--cell-size);
}
.heatmap__month-label {
  @apply absolute left-0 bottom-0 leading-4 text-xs text-(--aj-color-muted) whitespace-nowrap;
}

.heatmap__weeks {
  @apply flex gap-(--cell-gap);
}
.heatmap__week {
  @apply flex flex-col gap-(--cell-gap);
}

.heatmap__cell {
  @apply w-(--cell-size) bg-(--cell-bg) rounded-sm aspect-square cursor-pointer transition-opacity duration-100 ease-in-out not-disabled:hover:opacity-75;
}
.cell--future {
  @apply opacity-35 cursor-default pointer-events-none;
}

.heatmap__legend {
  @apply self-end flex items-center gap-(--cell-gap) text-center;
}
.heatmap__legend-label {
  @apply w-(--cell-size) text-xs text-(--aj-color-muted);
}
.heatmap__legend-cell {
  @apply w-(--cell-size) bg-(--cell-bg) rounded-sm aspect-square;
}

.heatmap__stats {
  @apply w-full flex justify-between;
}
.heatmap__stat {
  @apply flex flex-col;
}
.heatmap__stat-label {
  @apply text-xs text-(--aj-color-subtle);
}
.heatmap__stat-value {
  @apply text-(--aj-color-text);
}
</style>
