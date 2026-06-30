<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWordleStore } from '@/stores/wordle.ts';
import type { WordleShareResponse } from '@/types/wordle.ts';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  XMarkIcon,
  CheckIcon,
  ArrowsRightLeftIcon,
  Square2StackIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ChatBubbleLeftEllipsisIcon,
  TrashIcon
} from '@heroicons/vue/24/outline';
import { getToken } from '@/utils/jwt.ts';
import { formatCommentTime } from '@/utils/common.ts';
import DiaLog from '@/components/DiaLog.vue';
import { useToastStore } from '@/stores/toast.ts';
import { toPng } from 'html-to-image';

const route = useRoute();
const router = useRouter();
const wordleStore = useWordleStore();
const toastStore = useToastStore();

const toneClasses: Record<string, string> = {
  G: 'wordle-g',
  Y: 'wordle-y',
  W: 'wordle-w'
};

const isLoggedIn = computed(() => !!getToken());
const shareToken = computed(() => route.params.shareToken as string);

const data = ref<WordleShareResponse | null>(null);
const initData = async () => {
  try {
    data.value = await wordleStore.share(shareToken.value);
  } catch (err) {
    await router.push({ name: 'wordle-setup' });
  }
};
watch(
  shareToken,
  async (val) => {
    if (!val) return;
    await initData();
  },
  { immediate: true }
);

// 猜測紀錄是否顯示單字
const showAnswer = ref(false);
const translateText = computed(() =>
  showAnswer.value ? '顯示原文' : '翻譯年糕'
);

// 操作區：複製文字版
const COLOR_MAP: Record<string, string> = {
  G: '🟩',
  Y: '🟨',
  W: '⬜'
};
function toEmoji(result: string) {
  return result
    .split('')
    .map((char) => COLOR_MAP[char] ?? char)
    .join('');
}
const clipboard = computed(() => {
  if (!data.value) return '';
  const guesses = data.value.guesses;
  const emojis = guesses.map((guess) => toEmoji(guess.result));
  return [
    'wordle (alpJom)',
    `${guesses?.length}/${data.value.maxGuesses}`,
    ...emojis
  ].join('\n');
});
async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(clipboard.value);
    toastStore.notify('成功複製文字版結果！', { tone: 'success' });
  } catch (err) {
    toastStore.notify('複製文字版結果失敗，請稍後再試！', { tone: 'error' });
    console.error(err);
  }
}

// 操作區：保存圖片
const shareImageDom = ref<HTMLElement | null>(null);
async function downloadImage() {
  if (!shareImageDom.value) return;

  const PADDING = 24; // px
  const rect = shareImageDom.value.getBoundingClientRect();

  try {
    const dataUrl = await toPng(shareImageDom.value, {
      pixelRatio: 2,
      skipFonts: true, // 跳過嘗試內嵌 webfont,避免 CORS 噪音
      width: rect.width + PADDING * 2,
      height: rect.height + PADDING * 2,
      style: {
        padding: `${PADDING}px`
      }
    });
    const link = document.createElement('a');
    link.download = 'ajpJom-share.png';
    link.href = dataUrl;
    link.click();
  } catch (err) {
    toastStore.notify('保存產生失敗，請稍後再試！', { tone: 'error' });
    console.error(err);
  }
}

// 操作區：分享連結
async function shareLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    toastStore.notify('連結已複製！', { tone: 'success' });
  } catch (err) {
    toastStore.notify('複製失敗，請稍後再試！', { tone: 'error' });
    console.error(err);
  }
}

// 留言區
const loading = ref(false);
const comment = ref('');
async function submit() {
  if (loading.value) return;
  loading.value = true;

  try {
    await wordleStore.insertComment(shareToken.value, comment.value);
    comment.value = '';
    await initData();
  } catch (err) {
  } finally {
    loading.value = false;
  }
}
function handleEnter(e: KeyboardEvent) {
  if (e.shiftKey || e.isComposing) return;
  e.preventDefault();
  submit();
}

const dialogShow = ref(false);
const selectedCommentId = ref(0);
function openDialog(id: number) {
  selectedCommentId.value = id;
  dialogShow.value = true;
}
function closeDialog(close: () => void) {
  selectedCommentId.value = 0;
  close();
}
async function dialogSubmit(close: () => void) {
  try {
    await wordleStore.deleteComment(selectedCommentId.value);
    closeDialog(close);
    await initData();
  } catch (err) {}
}

onMounted(async () => {});
onBeforeUnmount(() => {
  wordleStore.reset();
});
</script>

<template>
  <DefaultLayout>
    <section
      v-if="data"
      class="h-full w-full flex flex-col pt-3 gap-4 overflow-y-auto"
    >
      <article
        ref="shareImageDom"
        class="w-full flex flex-col gap-4 bg-(--aj-color-bg)"
      >
        <!-- 玩家資料 -->
        <div class="flex items-center gap-2 select-none">
          <img
            :src="data.avatar"
            alt="player avatar"
            class="avatar"
            crossorigin="anonymous"
          />
          <RouterLink
            :to="{ name: 'profile', params: { username: data.username } }"
            class="username"
          >
            {{ data.username }}
          </RouterLink>
        </div>

        <!-- 遊戲結果 -->
        <div v-if="data.isWin" class="flex flex-col">
          <p>
            <HandThumbUpIcon class="inline-block h-5 w-5 -translate-y-0.5" />
            太棒了！成功通關，這一局打得漂亮。
          </p>
          <p class="text-xs text-(--aj-color-muted)">
            Awesome! You cleared the level — nicely played!
          </p>
        </div>
        <div v-else class="flex flex-col">
          <p>
            <HandThumbDownIcon class="inline-block h-5 w-5 -translate-y-0.5" />
            可惜，差一點點就成功了，再來一次吧！
          </p>
          <p class="text-xs text-(--aj-color-muted)">
            So close! You almost made it — give it another try!
          </p>
        </div>

        <!-- 猜測紀錄 -->
        <div class="shrink-0 max-h-52 flex overflow-y-auto">
          <ul class="flex flex-col gap-1.5">
            <li
              v-for="(g, idx) in data.guesses"
              :key="'guess' + idx"
              class="flex gap-1"
            >
              <span
                v-if="!showAnswer"
                v-for="(r, i) in g.result"
                :key="'result' + i"
                class="square-char"
                :class="{
                  'bg-(--aj-tone-success-text)/80!': r === 'G',
                  'bg-(--aj-tone-warning-text)/80!': r === 'Y'
                }"
              >
                <Component
                  :is="
                    r === 'G'
                      ? CheckIcon
                      : r === 'Y'
                        ? ArrowsRightLeftIcon
                        : XMarkIcon
                  "
                />
              </span>
              <span
                v-else
                v-for="(w, i) in g.guessWord"
                :key="'word' + i"
                class="wordle-item w-[1.5ch] text-xl text-center"
                :class="toneClasses[g.result[i]]"
              >
                {{ w.toUpperCase() }}
              </span>
            </li>
          </ul>
        </div>
        <p
          class="self-start -mt-3 text-xs text-(--aj-color-muted) cursor-pointer transition-colors duration-300 hover:text-(--aj-color-subtle)"
          @click="showAnswer = !showAnswer"
        >
          {{ translateText }}
        </p>

        <!-- Hashtags -->
        <div class="flex gap-2">
          <p class="hashtag">#wordle</p>
          <p class="hashtag">#{{ data.mode }}</p>
          <p class="hashtag">#{{ data.difficulty }}</p>
          <p class="hashtag">
            #{{ data.guesses.length }}/{{ data.maxGuesses || '∞' }}
          </p>
        </div>
      </article>

      <!-- 分享操作區 -->
      <div class="flex justify-between select-none">
        <button type="button" class="btn-icon" @click="copyToClipboard">
          <Square2StackIcon class="h-4 aspect-square" />
          <span>複製文字版</span>
        </button>
        <button type="button" class="btn-icon" @click="downloadImage">
          <ArrowDownTrayIcon class="h-4 aspect-square" />
          <span>保存圖片</span>
        </button>
        <button type="button" class="btn-icon" @click="shareLink">
          <ShareIcon class="h-4 aspect-square" />
          <span>分享連結</span>
        </button>
      </div>

      <!-- 留言區 -->
      <span class="divide-horizontal" />

      <div class="grow flex flex-col gap-4">
        <!-- 先導向登入 -->
        <RouterLink
          v-if="!isLoggedIn"
          :to="{ name: 'login' }"
          class="m-auto btn-primary"
        >
          立即登入一起討論 →
        </RouterLink>

        <!-- 輸入框 -->
        <form
          v-else
          id="comment-form"
          class="flex gap-2"
          @submit.prevent="submit"
        >
          <textarea
            name="comment"
            id="comment"
            maxlength="500"
            placeholder="說點什麼..."
            class="field-sizing-content max-h-24 w-full py-1.5 px-2.5 bg-(--aj-color-surface) placeholder:text-(--aj-color-placeholder) outline-0 rounded-md resize-none"
            v-model="comment"
            @keydown.enter="handleEnter"
          />
          <button
            form="comment-form"
            type="submit"
            class="self-end shrink-0 h-9 p-2 flex items-center gap-1 border border-transparent rounded-md cursor-pointer transition-all duration-300 hover:border-(--aj-color-border)"
          >
            <ChatBubbleLeftEllipsisIcon class="h-full aspect-square" />
            <span class="text-sm">留言</span>
          </button>
        </form>

        <!-- 留言列表 -->
        <p
          v-if="data.comments.length <= 0"
          class="py-4 text-sm text-(--aj-color-subtle) text-center"
        >
          暫無留言
        </p>
        <template v-else>
          <template
            v-for="comment in data.comments"
            :key="'comment' + comment.id"
          >
            <span class="divide-horizontal" />
            <div class="flex gap-2">
              <img :src="comment.avatar" alt="player avatar" class="avatar" />
              <div class="w-full flex flex-col gap-1 items-start">
                <div class="w-full flex items-center gap-2">
                  <RouterLink
                    :to="{
                      name: 'profile',
                      params: { username: comment.username }
                    }"
                    class="username"
                  >
                    {{ comment.username }}
                  </RouterLink>
                  <p class="text-sm text-(--aj-color-subtle)">
                    {{ formatCommentTime(comment.createdAt) }}
                  </p>
                  <TrashIcon
                    class="ms-auto h-4 aspect-square text-(--aj-color-subtle) cursor-pointer transition-colors duration-300 hover:text-(--aj-color-danger)"
                    @click="openDialog(comment.id)"
                  />
                </div>
                <p class="whitespace-pre-wrap">
                  {{ comment.content }}
                </p>
              </div>
            </div>
          </template>
        </template>
      </div>
    </section>
  </DefaultLayout>

  <DiaLog
    v-model="dialogShow"
    title="確定要刪除此留言？"
    description="二次確認"
  >
    <template #footer="{ close }">
      <button type="button" class="btn-danger" @click="dialogSubmit(close)">
        確認刪除
      </button>
    </template>
  </DiaLog>
</template>

<style scoped>
@reference '@/assets/styles/style';

.avatar {
  @apply h-10 aspect-square object-cover border border-(--aj-color-border) rounded-full;
}
.username {
  @apply leading-none before:content-['@'] before:inline-block before:text-(--aj-color-subtle) before:font-light before:-translate-y-px;

  &:hover {
    @apply underline cursor-pointer;
  }
}

.square-char {
  @apply inline-block p-1 h-7 aspect-square text-(--aj-color-bg) bg-(--aj-color-subtle) rounded-xs;
}

.hashtag {
  @apply text-sm text-(--aj-color-subtle);
}

.btn-icon {
  @apply flex items-center gap-0.5 text-xs cursor-pointer transition-all duration-300 ease-in-out;

  &:hover {
    @apply text-(--aj-color-muted);
  }
}
</style>
