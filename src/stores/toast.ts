import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type ToastTone = 'info' | 'success' | 'warning' | 'error';

export type ToastOptions = {
  duration?: number;
  tone?: ToastTone;
};

export type ToastItem = {
  id: number;
  message: string;
  duration: number;
  tone: ToastTone;
};

const DEFAULT_DURATION = 2500;

export const useToastStore = defineStore('toast', () => {
  const items = ref<ToastItem[]>([]);
  const timers = new Map<number, ReturnType<typeof window.setTimeout>>();
  let sequence = 0;

  function remove(id: number) {
    const timer = timers.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.delete(id);
    }

    items.value = items.value.filter((item) => item.id !== id);
  }

  function notify(message: string, options: ToastOptions = {}) {
    const normalizedMessage = message.trim();
    if (!normalizedMessage) return null;

    const duration = options.duration ?? DEFAULT_DURATION;
    const id = Date.now() + sequence;
    sequence += 1;

    items.value.push({
      id,
      message: normalizedMessage,
      duration,
      tone: options.tone ?? 'info'
    });

    // 如果存在時間設定為 0 則需手動 remove() 或 clear() 才會消失
    // 在調用 notify() 時會回傳 id -> if (id !== null) remove(id)
    if (duration > 0) {
      const timer = window.setTimeout(() => remove(id), duration);
      timers.set(id, timer);
    }

    return id;
  }

  function clear() {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
    items.value = [];
  }

  return {
    toasts: computed(() => items.value),
    notify,
    remove,
    clear
  };
});
