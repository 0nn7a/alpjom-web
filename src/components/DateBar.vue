<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { toTaiwanDateStr } from '@/utils/common.ts';

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── 狀態 ─────────────────────────────────────────────────────────────
const today = new Date();
const selectedDate = defineModel<Date>({ required: true });
const isSelected = (d: Date) =>
  toTaiwanDateStr(d) === toTaiwanDateStr(selectedDate.value);

// ── 日期清單（懶加載，以月為單位往前擴充）─────────────────────────────
// 從「今天所在月份」開始，往前追加月份
const loadedMonths = ref(0); // 已額外加載的月數（不含當月）

function getDaysInMonth(year: number, month: number): Date[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from(
    { length: daysInMonth },
    (_, i) => new Date(year, month, i + 1)
  ).filter((d) => d <= today);
}

const days = computed(() => {
  const result: Date[] = [];
  for (let offset = loadedMonths.value; offset >= 0; offset--) {
    const d = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    result.push(...getDaysInMonth(d.getFullYear(), d.getMonth()));
  }
  return result;
});

function loadPrevMonth() {
  loadedMonths.value++;
}

// ── 右側 Next in 文字 ────────────────────────────────────────────────
const nextInText = ref('');

function updateNextIn() {
  const now = new Date();
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );
  const diffMs = endOfDay.getTime() - now.getTime();
  const totalMins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  nextInText.value = hrs > 0 ? `${hrs} hrs` : `${mins} mins`;
}

let nextInTimer: ReturnType<typeof setInterval>;

// ── Scroll → 自動選中 ────────────────────────────────────────────────
const scrollDom = ref<HTMLDivElement | null>(null);
let scrollEndTimer: ReturnType<typeof setTimeout>;

function onScroll() {
  clearTimeout(scrollEndTimer);
  scrollEndTimer = setTimeout(() => {
    snapSelect();
  }, 80);
}

function snapSelect() {
  const container = scrollDom.value;
  if (!container) return;

  const containerCenter =
    container.getBoundingClientRect().left + container.clientWidth / 2;
  const items = Array.from(
    container.querySelectorAll<HTMLElement>('li[data-date]')
  );

  let closest: HTMLElement | null = null;
  let minDist = Infinity;
  for (const item of items) {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.left + rect.width / 2;
    const dist = Math.abs(itemCenter - containerCenter);
    if (dist < minDist) {
      minDist = dist;
      closest = item;
    }
  }

  if (closest) {
    const dateStr = closest.dataset.date!;
    const found = days.value.find((d) => toTaiwanDateStr(d) === dateStr);
    if (found) selectedDate.value = found;
  }
}

// ── 懶加載：觀察最左側 sentinel ──────────────────────────────────────
const sentinelDom = ref<HTMLLIElement | null>(null);
let observer: IntersectionObserver | null = null;

function setupObserver() {
  observer?.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        const container = scrollDom.value;
        if (!container) return;

        // 記住當前 scrollLeft，加載後補回偏移量避免畫面跳動
        const prevScrollWidth = container.scrollWidth;
        loadPrevMonth();

        requestAnimationFrame(() => {
          const newScrollWidth = container.scrollWidth;
          container.scrollLeft += newScrollWidth - prevScrollWidth;
        });
      }
    },
    { root: scrollDom.value, threshold: 0.1 }
  );
  if (sentinelDom.value) observer.observe(sentinelDom.value);
}

// ── 滾動到指定日期 ───────────────────────────────────────────────────
function scrollToDate(target: Date, behavior: ScrollBehavior = 'smooth') {
  const container = scrollDom.value;
  if (!container) return;

  const targetStr = toTaiwanDateStr(target);
  const items = Array.from(
    container.querySelectorAll<HTMLElement>('li[data-date]')
  );
  const el = items.find((e) => e.dataset.date === targetStr);
  el?.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
}

// ── 點擊修改選中日期 ──────────────────────────────────────────────────
function selectDate(d: Date) {
  selectedDate.value = d;
  scrollToDate(d);
}

// ── 生命週期 ─────────────────────────────────────────────────────────
onMounted(() => {
  updateNextIn();
  nextInTimer = setInterval(updateNextIn, 30000);

  // 先多載一個月，避免初始只有幾天可以滑
  loadPrevMonth();

  requestAnimationFrame(() => {
    scrollToDate(today, 'instant');
    setupObserver();
  });
});

onUnmounted(() => {
  observer?.disconnect();
  clearInterval(nextInTimer);
  clearTimeout(scrollEndTimer);
});
</script>

<template>
  <div class="w-full flex flex-col gap-2 select-none">
    <div
      ref="scrollDom"
      class="overflow-x-auto snap-x snap-mandatory"
      style="-webkit-overflow-scrolling: touch"
      @scroll="onScroll"
    >
      <ul class="flex gap-2">
        <!-- 懶加載 sentinel（最左側不可見元素）-->
        <li ref="sentinelDom" class="shrink-0 w-px" aria-hidden="true" />

        <!-- 日期列表 -->
        <li
          v-for="day in days"
          :key="toTaiwanDateStr(day)"
          :data-date="toTaiwanDateStr(day)"
          class="shrink-0 snap-center w-12 flex flex-col items-center gap-0.5 py-3! border rounded-2xl cursor-pointer transition-all duration-300 ease-in-out"
          :class="
            isSelected(day)
              ? 'text-(--aj-color-text) border-(--aj-color-border)'
              : 'text-(--aj-color-subtle) border-transparent scale-85'
          "
          @click="selectDate(day)"
        >
          <p
            class="text-xs leading-none transition-all duration-300 ease-in-out"
            :class="{ 'text-(--aj-color-danger)': isSelected(day) }"
          >
            {{ WEEKDAY[day.getDay()] }}
          </p>
          <p class="text-xl leading-none font-semibold">{{ day.getDate() }}</p>
        </li>

        <!-- 右側 Next in 提示（不可 snap，僅顯示）-->
        <li
          class="shrink-0 flex flex-col items-start justify-center gap-0.5 px-4! pe-24! text-(--aj-color-subtle)"
          aria-hidden="true"
        >
          <p class="text-xs leading-none">Next in</p>
          <p class="text-base leading-none font-semibold">{{ nextInText }}</p>
        </li>
      </ul>
    </div>

    <button
      type="button"
      class="text-xs text-(--aj-color-muted) cursor-pointer transition-all duration-300 ease-in-out hover:text-(--aj-color-text)"
      @click="scrollToDate(today)"
    >
      Today →
    </button>
  </div>
</template>

<style scoped></style>
