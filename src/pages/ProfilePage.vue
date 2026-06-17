<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { HeatmapCell } from '@/types/heatmap.ts';
import HeatMap from '@/components/HeatMap.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useAuthStore } from '@/stores/auth.ts';
import { useTooltipStore } from '@/stores/tooltip.ts';
import {
  CheckBadgeIcon,
  PencilSquareIcon,
  CheckIcon,
  PlusIcon
} from '@heroicons/vue/24/outline';
import ToolTip from '@/components/ToolTip.vue';
import DiaLog from '@/components/DiaLog.vue';
import { useProfileStore } from '@/stores/profile.ts';
import { ApiError } from '@/types/common.ts';
import { useToastStore } from '@/stores/toast.ts';
import FormInput from '@/components/FormInput.vue';
import { useFormValidation } from '@/composables/useFormValidation.ts';

const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();
const profileStore = useProfileStore();
const tooltipStore = useTooltipStore();
const toastStore = useToastStore();

// 當前查找用戶及是否有修改權限
const pathUsername = computed(() => route.params.username as string);
const isSameUser = computed(
  () => pathUsername.value === authStore.user?.username
);

// DiaLog
const dialogAvatarShow = ref(false);
watch(dialogAvatarShow, async (val) => {
  if (val) await profileStore.getAvatar();
});

const dialogEditShow = ref(false);
watch(dialogEditShow, async (val) => {
  if (!val) {
    submitAttempted.value = false;
    profileStore.resetForm();
  }
});

const { requires, errors, submitAttempted, handleSubmit } = useFormValidation(
  profileStore.form,
  profileStore.fieldRules
);
const submit = (close: () => void) =>
  handleSubmit(async () => {
    await profileStore.updateForm(close);
  });

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
      profileStore.username = val;
      await profileStore.initProfile();
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message + '將自動導向回首頁。', {
          tone: 'error'
        });
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
    <div class="-m-4 p-4 flex flex-col items-start text-(--aj-color-muted)">
      <div class="avatar__grid">
        <template v-for="a in profileStore.avatarUploaded" :key="a">
          <input
            :id="'avatar' + a.id"
            name="avatars"
            type="checkbox"
            :value="a.id"
            v-model="profileStore.avatarSelected"
            class="avatar__checkbox"
          />
          <label :for="'avatar' + a.id" class="avatar__item">
            <img :src="a.fileUrl" :alt="'avatar' + a.id" />
            <span class="avatar__frame">
              <CheckIcon class="m-auto h-5 w-5" />
            </span>
          </label>
        </template>

        <input
          type="file"
          accept="image/jpeg, image/png, image/jpg, image/gif"
          name="upload-avatar"
          id="upload-avatar"
          class="hidden"
          @change="profileStore.uploadAvatar"
        />
        <label for="upload-avatar" class="avatar__item">
          <PlusIcon class="m-auto h-5 w-5" />
        </label>
      </div>

      <p class="mt-4 text-xs text-(--aj-color-danger)">
        *按鈕「刪除」將立即清除所有選中頭貼，請謹慎操作
      </p>
      <p class="mt-0.5 text-xs text-(--aj-color-muted)">
        *使用中的頭貼被刪除時，將自動套用預設頭貼
      </p>
    </div>

    <template #footer="{ close }">
      <button
        type="button"
        :class="profileStore.avatarCanDelete ? 'btn-danger' : 'btn-disabled'"
        :disabled="!profileStore.avatarCanDelete"
        @click="profileStore.deleteAvatar"
      >
        刪除
      </button>
      <button
        type="button"
        :class="profileStore.avatarCanUpdate ? 'btn-success' : 'btn-disabled'"
        :disabled="!profileStore.avatarCanUpdate"
        @click="profileStore.updateAvatar(close)"
      >
        確認
      </button>
    </template>
  </DiaLog>

  <DiaLog v-model="dialogEditShow" title="修改使用者資料">
    <form class="flex flex-col text-(--aj-color-muted)">
      <FormInput
        title="Username"
        :placeholder="pathUsername"
        v-model="profileStore.form.username"
        :error="errors.username"
        :showError="submitAttempted"
        :required="requires.username"
      />
      <FormInput
        title="Old Password"
        placeholder="舊密碼（修改密碼時必填）"
        v-model="profileStore.form.passwordOld"
        :error="errors.passwordOld"
        :showError="submitAttempted"
        :required="requires.passwordOld"
        lblClass="mt-3"
      />
      <FormInput
        title="New Password"
        placeholder="功能開發中"
        v-model="profileStore.form.password"
        :error="errors.password"
        :showError="submitAttempted"
        :required="requires.password"
        lblClass="mt-3"
      />
    </form>
    <p class="mt-4 text-xs text-(--aj-color-danger)">
      *修改使用者資料後將自動登出
    </p>

    <template #footer="{ close }">
      <button type="button" class="btn-primary" @click="submit(close)">
        送出
      </button>
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

<style scoped>
@reference '@/assets/styles/style.css';

.avatar__grid {
  @apply w-full grid grid-cols-5 gap-2 select-none;
}
.avatar__checkbox {
  @apply hidden;

  &:checked + .avatar__item {
    @apply border-(--aj-color-border-active) ring-2 ring-(--aj-color-ring);

    .avatar__frame {
      @apply opacity-100;
    }
  }
}
.avatar__item {
  @apply relative flex bg-(--aj-color-surface) border border-transparent aspect-square rounded-md overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:bg-(--aj-color-surface-hover) hover:border-(--aj-color-border);

  img {
    @apply h-full w-full object-cover;
  }
}
.avatar__frame {
  @apply flex absolute inset-0 text-white bg-neutral-600/50 opacity-0 transition-opacity duration-300 ease-in-out;
}
</style>
