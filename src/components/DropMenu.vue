<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth.ts';

const authStore = useAuthStore();

interface MenuItem {
  label: string;
  to?: string | RouteLocationRaw;
  href?: string;
  caption?: string;
  disabled?: boolean;
  variant?: 'default' | 'danger';
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
const defaultSections = computed<MenuSection[]>(() => [
  {
    label: 'alpJom',
    items: [
      { label: 'Home', to: { name: 'home' } },
      { label: 'Profile', to: { name: 'profile' } },
      { label: 'Wordle', to: { name: 'wordle-setup' } },
      { label: 'Color', to: { name: 'color' } }
    ]
  },
  {
    label: 'links',
    items: [
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Support', href: 'https://support.example.com', disabled: true },
      { label: 'API', href: 'https://api.example.com', disabled: true }
    ]
  },
  {
    items: [
      { label: 'Log out', variant: 'danger', action: () => authStore.logout() }
    ]
  }
]);

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

// 動態 class — 每個選項的基礎樣式
function itemClass(item: MenuItem) {
  const base = [
    'flex items-center justify-between w-full rounded-md px-2.5 py-1.5 gap-1.5',
    'text-sm select-none cursor-pointer transition-all duration-100'
  ];
  if (item.disabled) {
    base.push('text-(--aj-color-placeholder) cursor-not-allowed!');
  } else if (item.variant === 'danger') {
    base.push('text-(--aj-color-danger) hover:bg-(--aj-color-danger-ring)');
  } else {
    base.push('text-(--aj-color-text) hover:bg-(--aj-color-ring)');
  }
  return base.join(' ');
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
      :enter-active-class="`transition-all duration-150 ease-out ${props.direction === 'up' ? 'origin-bottom-left' : 'origin-top-left'}`"
      :leave-active-class="`transition-all duration-100 ease-in ${props.direction === 'up' ? 'origin-bottom-left' : 'origin-top-left'}`"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
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

          <!-- 選項 -->
          <div class="px-1">
            <template v-for="item in section.items" :key="item.label">
              <!-- Disabled 狀態 -->
              <span
                v-if="item.disabled"
                :class="itemClass(item)"
                role="menuitem"
                :title="`${item.label}${item.caption ? `\n${item.caption}` : ''}`"
              >
                <span class="flex items-center gap-2">
                  {{ item.label }}
                </span>
                <span class="flex items-center gap-1.5">
                  <span
                    v-if="item.caption"
                    class="text-xs text-(--aj-color-subtle)"
                  >
                    {{ item.caption }}
                  </span>
                </span>
              </span>

              <!-- 外部連結 -->
              <a
                v-else-if="item.href"
                :href="item.href"
                target="_blank"
                rel="noopener noreferrer"
                @click="close"
                :class="itemClass(item)"
                role="menuitem"
                :title="`${item.label}${item.caption ? `\n${item.caption}` : ''}`"
              >
                <span class="flex items-center gap-2">
                  {{ item.label }}
                </span>
                <span class="flex items-center gap-1.5">
                  <span
                    v-if="item.caption"
                    class="text-xs text-(--aj-color-subtle)"
                  >
                    {{ item.caption }}
                  </span>
                  <!-- 外部連結箭頭 -->
                  <svg
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
              </a>

              <!-- Router 路由 -->
              <RouterLink
                v-else-if="item.to"
                :to="item.to"
                @click="close"
                :class="itemClass(item)"
                role="menuitem"
                :title="`${item.label}${item.caption ? `\n${item.caption}` : ''}`"
              >
                <span> {{ item.label }} </span>
                <span
                  v-if="item.caption"
                  class="max-w-[5ch] text-xs text-(--aj-color-subtle)"
                >
                  {{ item.caption }}
                </span>
              </RouterLink>

              <!-- 一般方法 -->
              <button
                v-else-if="item.action"
                @click="
                  item.action();
                  close();
                "
                :class="itemClass(item)"
                role="menuitem"
              >
                <span> {{ item.label }} </span>
                <span
                  v-if="item.caption"
                  class="max-w-[5ch] text-xs text-(--aj-color-subtle)"
                >
                  {{ item.caption }}
                </span>
              </button>
            </template>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins.scss' as *;

span {
  @include omit-text(1);
}
</style>
