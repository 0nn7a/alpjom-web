<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { HeatmapCell } from '@/types/heatmap.ts';
import HeatMap from '@/components/HeatMap.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useAuthStore } from '@/stores/auth.ts';
import { useToastStore } from '@/stores/toast.ts';
import { useTooltipStore } from '@/stores/tooltip.ts';
import { profileService } from '@/services/profile.ts';
import { cloudService } from '@/services/cloud.ts';
import { CheckBadgeIcon, PencilSquareIcon } from '@heroicons/vue/24/outline';
import ToolTip from '@/components/ToolTip.vue';
import DiaLog from '@/components/DiaLog.vue';
import { useProfileStore } from '@/stores/profile.ts';

const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();
const toastStore = useToastStore();
const profileStore = useProfileStore();
const tooltipStore = useTooltipStore();

// 當前查找用戶及是否有修改權限
const pathUsername = computed(() => route.params.username as string);
const isSameUser = computed(
  () => pathUsername.value === authStore.user?.username
);

// 上傳圖片
const handleUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const res = await cloudService.upload(file);
  console.log('上傳成功，URL:', res.data);
};

// DiaLog
const dialogAvatarShow = ref(false);
const dialogEditShow = ref(false);

// HeatMap
function handleDayClick(cell: HeatmapCell) {
  console.log('點擊日期', cell.date, '完成', cell.count, '局');
}

// Tooltip 內容格式化
function formatDate(content: unknown): string {
  const { date } = content as HeatmapCell;
  const [y, m, d] = date.split('-');
  return `${y} 年 ${parseInt(m)} 月 ${parseInt(d)} 日`;
}
function formatCount(content: unknown): string {
  const { count, isFuture } = content as HeatmapCell;
  if (isFuture) return '—';
  return count === 0 ? '無完成紀錄' : `完成 ${count} 局`;
}

// 查找用戶變化時重新取得資料
watch(
  pathUsername,
  async (val) => {
    try {
      await profileStore.initProfile(val);
    } catch (err) {
      await router.push({ name: 'home' });
    }
  },
  { immediate: true }
);
</script>

<template>
  <DefaultLayout>
    <div class="w-full relative flex flex-col pt-6 px-3 overflow-hidden">
      <img
        class="absolute inset-0 h-16 w-full object-cover rounded"
        src="https://pub-bf0bdbb9cd5b445db961a77785d77f93.r2.dev/Default/profile-cover-grey.png"
        alt="profile cover"
      />

      <div class="z-1 shrink-0 flex flex-col items-start">
        <div
          class="relative flex h-16 border-2 border-(--aj-color-bg) rounded-full aspect-square overflow-hidden"
        >
          <template v-if="isSameUser">
            <span
              v-if="isSameUser"
              class="absolute inset-0 flex text-transparent cursor-pointer transition-all duration-300 hover:text-white hover:bg-neutral-600/50"
              @click="dialogAvatarShow = true"
            >
              <PencilSquareIcon class="m-auto h-5 w-5" />
            </span>
          </template>
          <img
            class="h-full w-full object-cover"
            :src="profileStore.avatar"
            alt="profile avatar"
          />
        </div>

        <div class="w-full flex items-center gap-1">
          <p
            class="text-xl before:content-['@'] before:inline-block before:text-(--aj-color-subtle) before:font-light before:-translate-y-px"
          >
            {{ pathUsername }}
          </p>
          <CheckBadgeIcon
            v-if="profileStore.isDailyDone"
            class="h-5 aspect-square"
            @mouseenter="tooltipStore.show($event, '已完成任意今日謎題✨')"
            @mouseleave="tooltipStore.hide"
          />
          <PencilSquareIcon
            v-if="isSameUser"
            class="ms-auto h-4 aspect-square text-(--aj-color-border) cursor-pointer transition-colors duration-300 hover:text-(--aj-color-border-active)"
            @click="dialogEditShow = true"
          />
        </div>

        <div class="mt-2 w-full flex justify-between">
          <div class="flex flex-col">
            <p class="text-xs text-(--aj-color-subtle)">遊玩次數</p>
            <p>{{ profileStore.totalDone }}</p>
          </div>

          <span class="divide-vertical" />

          <div class="flex flex-col">
            <p class="text-xs text-(--aj-color-subtle)">擁有成就</p>
            <p>{{ profileStore.totalAchievements }}</p>
          </div>

          <span class="divide-vertical" />

          <div class="flex flex-col">
            <p class="text-xs text-(--aj-color-subtle)">加入時間</p>
            <p>{{ profileStore.joinTime }}</p>
          </div>
        </div>
      </div>

      <span class="divide-horizontal my-4"></span>

      <section class="grow flex flex-col overflow-x-hidden overflow-y-auto">
        <p class="mb-4 text-sm">簽到打卡</p>
        <HeatMap
          :records="profileStore.heatmap"
          :show-stats="true"
          @day-click="handleDayClick"
        />

        <span class="divide-horizontal my-4"></span>

        <p class="mb-4 text-sm">遊戲統計及分析</p>
        <div class="shrink-0 h-24 flex bg-(--aj-color-surface) rounded">
          <p class="m-auto text-sm text-(--aj-color-muted)">Coming soon...</p>
        </div>
      </section>
    </div>
  </DefaultLayout>

  <DiaLog v-model="dialogAvatarShow" title="修改頭貼">
    <div class="flex flex-col items-start gap-2 text-(--aj-color-muted)">
      <input
        type="file"
        accept="image/*"
        name="upload-avatar"
        id="upload-avatar"
        class="hidden"
        @change="handleUpload"
      />
      <p>——開發中——</p>
      <p>這裡將會列出所有該用戶上傳的頭貼，可供刪除、選擇或上傳更多。</p>
    </div>
    <template #footer>
      <button type="button" class="btn-primary">確認</button>
    </template>
  </DiaLog>

  <DiaLog v-model="dialogEditShow" title="修改使用者資料">
    <div class="flex flex-col items-start gap-2 text-(--aj-color-muted)">
      <p>——開發中——</p>
      <p>這裡將會提供修改用戶名、密碼的功能。</p>
    </div>
    <template #footer>
      <button type="button" class="btn-primary">確認</button>
    </template>
  </DiaLog>

  <ToolTip>
    <template #default="{ content }">
      <!-- 純字串直接顯示 -->
      <template v-if="typeof content === 'string'">
        {{ content }}
      </template>
      <!-- HeatmapCell 類型格式化顯示 -->
      <template v-else>
        <p>{{ formatDate(content) }}</p>
        <p>{{ formatCount(content) }}</p>
      </template>
    </template>
  </ToolTip>
</template>

<style scoped></style>
