<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { HeatmapCell } from '@/types/heatmap.ts';
import { ApiError } from '@/types/common.ts';
import HeatMap from '@/components/HeatMap.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useAuthStore } from '@/stores/auth.ts';
import { useTooltipStore } from '@/stores/tooltip.ts';
import { useProfileStore } from '@/stores/profile.ts';
import { useToastStore } from '@/stores/toast.ts';
import {
  CheckBadgeIcon,
  PencilSquareIcon,
  CheckIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline';
import ToolTip from '@/components/ToolTip.vue';
import DiaLog from '@/components/DiaLog.vue';
import FormInput from '@/components/FormInput.vue';
import { useFormValidation } from '@/composables/useFormValidation.ts';
import RollingNumber from '@/components/RollingNumber.vue';
import type { User } from '@/types/auth.ts';

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

// 編輯頭貼
const dialogAvatarShow = ref(false);
watch(dialogAvatarShow, async (val) => {
  if (val) await profileStore.getAvatar();
});

const loading = ref(false);
const upload = async (e: Event) => {
  try {
    loading.value = true;
    await profileStore.uploadAvatar(e);
  } finally {
    loading.value = false;
  }
};

// 編輯使用者基本資料
const dialogEditShow = ref(false);
watch(dialogEditShow, async (val) => {
  if (!val) {
    submitAttempted.value = false;
    profileStore.clearForm();
  }
});

const pwdHide = ref(false);
const pwdType = computed(() => (pwdHide.value ? 'text' : 'password'));

const { requires, errors, submitAttempted, handleSubmit } = useFormValidation(
  profileStore.form,
  profileStore.fieldRules
);
const submit = (close: () => void) =>
  handleSubmit(async () => {
    const hasUsername = !!profileStore.form.username;
    const hasPassword = !!profileStore.form.password;

    if (!hasUsername && !hasPassword) {
      toastStore.notify('使用者資料無變更！', { tone: 'info' });
      close();
      return;
    }

    try {
      if (hasUsername) await profileStore.updateForm();
      if (hasPassword) await profileStore.updatePassword();

      toastStore.notify('使用者資料已成功更新！', { tone: 'success' });
      close();
      await authStore.logout();
    } catch (err) {
      if (err instanceof ApiError)
        toastStore.notify(err.message, { tone: 'error' });
    }
  });

// 追蹤關係列表
const dialogFollowShow = ref(false);
watch(dialogFollowShow, async (val) => {
  if (val) {
    try {
      loading.value = true;
      switch (dialogFollowTitle.value) {
        case '粉絲列表':
          dialogFollowList.value = await profileStore.getFollower();
          break;
        case '追蹤中列表':
          dialogFollowList.value = await profileStore.getFollowing();
          break;
      }
    } finally {
      loading.value = false;
    }
  } else {
    dialogFollowTitle.value = '';
    dialogFollowList.value = [];
  }
});

const dialogFollowTitle = ref('');
const dialogFollowList = ref<User[]>([]);
async function openDialogFollow(title: string) {
  dialogFollowTitle.value = title;
  dialogFollowShow.value = true;
}

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

// 離開頁面時清上一位用戶資料避免殘留
onBeforeUnmount(() => {
  profileStore.reset();
});
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
          <p class="text-xl prefix-at">
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

        <div
          class="mb-2 w-full flex items-center gap-2 text-xs text-(--aj-color-subtle)"
        >
          <button
            type="button"
            class="cursor-pointer transition-colors duration-300 hover:text-(--aj-color-muted)"
            @click="openDialogFollow('粉絲列表')"
          >
            粉絲
            <RollingNumber :value="profileStore.follow?.followerCount || 0" />
          </button>
          <button
            type="button"
            class="cursor-pointer transition-colors duration-300 hover:text-(--aj-color-muted)"
            @click="openDialogFollow('追蹤中列表')"
          >
            追蹤中
            <RollingNumber :value="profileStore.follow?.followingCount || 0" />
          </button>
        </div>
        <button
          v-if="!isSameUser"
          type="button"
          class="mb-2 w-full text-xs"
          :class="profileStore.follow?.following ? 'btn-primary' : 'btn-solid'"
          @click="profileStore.toggleFollow"
        >
          {{ profileStore.follow?.following ? '追蹤中' : '追蹤對方' }}
        </button>

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

      <span class="divide-horizontal my-4" />

      <section class="grow flex flex-col overflow-x-hidden overflow-y-auto">
        <p class="mb-4 text-sm">簽到打卡</p>
        <HeatMap
          :records="profileStore.heatmap"
          :show-stats="true"
          @day-click="handleDayClick"
        />

        <span class="divide-horizontal my-4" />

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

        <span v-if="loading" class="avatar__item">
          <ArrowPathIcon
            class="m-auto h-5 w-5 animate-[spin_2s_linear_infinite]"
          />
        </span>

        <input
          type="file"
          accept="image/jpeg, image/png, image/jpg, image/gif"
          name="upload-avatar"
          id="upload-avatar"
          class="hidden"
          @change="upload"
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
    <template #default="{ close }">
      <form
        id="profile-form"
        class="flex flex-col text-(--aj-color-muted)"
        @submit.prevent="submit(close)"
      >
        <FormInput
          title="Username"
          :placeholder="pathUsername"
          v-model="profileStore.form.username"
          :error="errors.username"
          :showError="submitAttempted"
          :required="requires.username"
        />
        <FormInput
          title="Current Password"
          :type="pwdType"
          v-model="profileStore.form.passwordOld"
          :error="errors.passwordOld"
          :showError="submitAttempted"
          :required="requires.passwordOld"
          lblClass="mt-3"
        />
        <FormInput
          title="New Password"
          :type="pwdType"
          v-model="profileStore.form.password"
          :error="errors.password"
          :showError="submitAttempted"
          :required="requires.password"
          lblClass="mt-3"
        >
          <template #right>
            <Component
              :is="pwdHide ? EyeIcon : EyeSlashIcon"
              @click="pwdHide = !pwdHide"
              class="h-5 ms-2 text-(--aj-color-border) rounded-md cursor-pointer transition duration-300 hover:text-(--aj-color-border-active)"
            />
          </template>
        </FormInput>
      </form>
      <p class="mt-4 text-xs text-(--aj-color-danger)">
        *成功修改使用者資料後將自動登出
      </p>
      <p class="mt-0.5 text-xs text-(--aj-color-muted)">
        *舊密碼僅在修改密碼時必填
      </p>
      <p class="mt-0.5 text-xs text-(--aj-color-muted)">
        *若僅輸入舊密碼未輸入新密碼，將不會修改密碼
      </p>
    </template>

    <template #footer>
      <button form="profile-form" type="submit" class="btn-primary">
        送出
      </button>
    </template>
  </DiaLog>

  <DiaLog v-model="dialogFollowShow" :title="dialogFollowTitle">
    <template #default="{ close }">
      <div class="flex flex-col">
        <ArrowPathIcon
          v-if="loading"
          class="my-2.5 mx-auto h-5 w-5 animate-[spin_2s_linear_infinite]"
        />

        <p
          v-else-if="dialogFollowList.length <= 0"
          class="my-3 text-sm text-(--aj-color-subtle) text-center"
        >
          暫無資料
        </p>

        <template
          v-else
          v-for="(user, idx) in dialogFollowList"
          :key="'follower' + user.id"
        >
          <span v-if="idx" class="my-3 divide-horizontal" />
          <div class="flex items-center gap-3" :title="user.username">
            <img
              :src="user.avatar"
              :alt="user.username + ' avatar'"
              class="h-10 aspect-square border border-(--aj-color-surface-hover) object-cover rounded-full"
            />
            <button
              type="button"
              class="text-lg prefix-at truncate cursor-pointer hover:underline!"
              @click="
                close();
                router.push({
                  name: 'profile',
                  params: { username: user.username }
                });
              "
            >
              {{ user.username }}
            </button>
          </div>
        </template>
      </div>
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
