<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import { RouterLink } from 'vue-router';
import { ref, onMounted, onUnmounted, computed, type Component } from 'vue';
import { useAuthStore } from '@/stores/auth.ts';
import {
  UserIcon,
  PuzzlePieceIcon,
  ArrowLeftEndOnRectangleIcon,
  ArrowRightEndOnRectangleIcon
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();

interface MenuItem {
  label: string;
  icon?: Component;
  to?: string | RouteLocationRaw;
  href?: string;
  caption?: string;
  disabled?: boolean;
  variant?: 'success' | 'danger';
  action?: () => void;
}

interface MenuSection {
  label?: string;
  items: MenuItem[];
}

interface Props {
  sections?: MenuSection[];
  direction?: 'down' | 'up';
  align?: 'left' | 'right';
}

const props = withDefaults(defineProps<Props>(), {
  sections: () => [],
  direction: 'down',
  align: 'left'
});

// 把需要 runtime 才能建立的 sections 放在 computed
const defaultSections = computed<MenuSection[]>(() => {
  const authMenuItem: MenuItem = authStore.isLoggedIn
    ? {
        label: '登出',
        icon: ArrowLeftEndOnRectangleIcon,
        variant: 'danger',
        action: () => authStore.logout()
      }
    : {
        label: '登入',
        icon: ArrowRightEndOnRectangleIcon,
        variant: 'success',
        to: { name: 'login' }
      };

  return [
    {
      label: 'alpJom',
      items: [
        { label: '首頁', to: { name: 'home' } },
        {
          label: '個人資料',
          icon: UserIcon,
          to: {
            name: 'profile',
            params: { username: authStore.user?.username }
          },
          disabled: !authStore.isLoggedIn
        },
        {
          label: '排行榜',
          to: { name: 'ranking' },
          disabled: !authStore.isLoggedIn
        }
      ]
    },
    {
      label: 'Games',
      items: [
        {
          label: 'Wordle',
          icon: PuzzlePieceIcon,
          to: { name: 'wordle-setup' }
        },
        {
          label: '敬請期待',
          disabled: true
        }
      ]
    },
    {
      label: 'Author',
      items: [
        {
          label: 'Cake',
          href: 'https://www.cake.me/me/0nn/portfolios'
        },
        {
          label: '104',
          href: 'https://pda.104.com.tw/profile/share/a6cpdgDg7kSUoYTlTkzIs0y2qlLu7aWY'
        }
      ]
    },
    {
      label: 'Contact me',
      items: [
        {
          label: 'Email',
          href: 'mailto:eueu0nn@icloud.com?subject=Message%20from%20alpJom'
        }
      ]
    },
    {
      items: [authMenuItem]
    }
  ];
});

const activeSections = computed(() =>
  props.sections.length ? props.sections : defaultSections.value
);

const open = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const toggle = () => {
  open.value = !open.value;
};
const close = () => {
  open.value = false;
};

function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) close();
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside));
onUnmounted(() =>
  document.removeEventListener('mousedown', handleClickOutside)
);

// 每個選項的基礎樣式,依 variant / disabled 決定
function itemClass(item: MenuItem) {
  const base = [
    'flex items-center w-full rounded-md px-2.5 py-1.5 gap-1.5',
    'text-sm select-none cursor-pointer transition-all duration-100'
  ];
  if (item.disabled) {
    base.push('text-(--aj-color-placeholder) cursor-not-allowed!');
  } else if (item.variant === 'danger') {
    base.push('text-(--aj-color-danger) hover:bg-(--aj-color-danger-ring)');
  } else if (item.variant === 'success') {
    base.push(
      'text-(--aj-tone-success-text) hover:bg-(--aj-tone-success-text)/15'
    );
  } else {
    base.push('text-(--aj-color-text) hover:bg-(--aj-color-ring)');
  }
  return base.join(' ');
}

function itemTitle(item: MenuItem) {
  return `${item.label}${item.caption ? `\n${item.caption}` : ''}`;
}

// 依 item 種類決定要 render 哪個標籤 / 元件
function itemTag(item: MenuItem) {
  if (item.disabled) return 'span';
  if (item.href) return 'a';
  if (item.to) return RouterLink;
  return 'button';
}

// 依 item 種類組出對應的 props / 事件,交給 v-bind 使用
function itemBindings(item: MenuItem): Record<string, unknown> {
  const common = {
    class: itemClass(item),
    role: 'menuitem',
    title: itemTitle(item)
  };

  if (item.disabled) return common;

  if (item.href)
    return {
      ...common,
      href: item.href,
      target: '_blank',
      rel: 'noopener noreferrer nofollow',
      onClick: close
    };

  if (item.to)
    return {
      ...common,
      to: item.to,
      onClick: close
    };

  // action button
  return {
    ...common,
    type: 'button',
    onClick: () => {
      item.action?.();
      close();
    }
  };
}
</script>

<template>
  <div ref="menuRef" class="relative inline-block">
    <!-- 觸發按鈕（用 slot 可替換成任意內容） -->
    <slot name="trigger" :toggle="toggle" :open="open">
      <button
        @click="toggle"
        class="flex items-center gap-2 px-2.5 py-2 text-sm bg-(--aj-color-bg) border border-(--aj-color-border) rounded-md cursor-pointer transition-all duration-300 hover:bg-(--aj-color-surface)"
      >
        <span>Open</span>
        <svg
          class="w-4 h-4 transition-transform duration-300"
          :class="open ? 'rotate-180' : ''"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </slot>

    <!-- 下拉面板 -->
    <Transition
      name="drop"
      :enter-active-class="`transition-all duration-150 ease-out ${props.direction === 'up' ? 'origin-bottom-left' : 'origin-top-left'}`"
      :leave-active-class="`transition-all duration-100 ease-in ${props.direction === 'up' ? 'origin-bottom-left' : 'origin-top-left'}`"
    >
      <div
        v-if="open"
        class="absolute z-50 min-w-32 max-w-55 mt-1.5 py-1 bg-(--aj-color-bg) border border-(--aj-color-border) ring-2 ring-(--aj-color-ring) rounded-md overflow-hidden"
        :class="[
          props.align === 'right' ? 'right-0' : 'left-0',
          props.direction === 'up' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
        ]"
        role="menu"
      >
        <template v-for="(section, si) in activeSections" :key="si">
          <!-- 分隔線 -->
          <div v-if="si > 0" class="h-px bg-(--aj-color-ring) my-1 mx-0" />

          <!-- 區塊標題 -->
          <p
            v-if="section.label"
            class="px-3.5 pt-2 pb-1 text-xs text-(--aj-color-subtle) tracking-wide select-none"
          >
            {{ section.label }}
          </p>

          <!-- 選項：四種類型（disabled / 外部連結 / 路由 / action)統一用同一段 markup -->
          <div class="px-1">
            <component
              v-for="item in section.items"
              :key="item.label"
              :is="itemTag(item)"
              v-bind="itemBindings(item)"
            >
              <span class="w-4">
                <Component
                  v-if="item.icon"
                  :is="item.icon"
                  class="w-full aspect-square"
                />
              </span>

              <span>{{ item.label }}</span>

              <span class="ms-auto flex items-center gap-1.5">
                <span
                  v-if="item.caption"
                  class="max-w-[5ch] text-xs text-(--aj-color-subtle)"
                >
                  {{ item.caption }}
                </span>

                <!-- 只有外部連結才顯示的箭頭 -->
                <svg
                  v-if="item.href"
                  class="w-3 h-3 text-(--aj-color-subtle)"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M4 12L12 4M12 4H6.5M12 4V9.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </component>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@reference '@/assets/styles/style';

span {
  @apply truncate;
}

.drop-enter-active,
.drop-leave-active {
  transition: all 0.2s ease-in-out;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
