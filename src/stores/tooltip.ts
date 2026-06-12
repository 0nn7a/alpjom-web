import { defineStore } from 'pinia';
import { ref, nextTick } from 'vue';

const OFFSET_Y = 10; // trigger 上方的間距
const MARGIN = 8; // 距視窗邊緣的安全距離

export const useTooltipStore = defineStore('tooltip', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const visible = ref(false);
  const x = ref(0);
  const y = ref(0);

  /**
   * 顯示內容：純字串或任意物件皆可。
   * ToolTip 透過 default slot 渲染，呼叫方自行決定要顯示什麼。
   */
  const content = ref<unknown>(null);

  /**
   * ToolTip 組件掛載後透過 :ref 注入此欄位，
   * 讓 show() 能讀取實際渲染尺寸來計算精確位置。
   */
  const tooltipEl = ref<HTMLElement | null>(null);

  // ── Actions ────────────────────────────────────────────────────────────────
  /**
   * 顯示 tooltip 並計算位置。
   *
   * @param event   - 觸發的滑鼠事件（用來取得 trigger 的 BoundingRect）
   * @param payload - 要傳給 slot 的任意內容
   */
  async function show(event: MouseEvent, payload: unknown): Promise<void> {
    content.value = payload;
    visible.value = true;

    // 等 DOM 更新後再量測，確保 tooltipEl 已渲染
    await nextTick();

    const el = tooltipEl.value;
    // 若 el 尚未注入（極端情況），用保守預設值避免跑版
    const w = el?.offsetWidth ?? 160;
    const h = el?.offsetHeight ?? 40;

    const vw = window.innerWidth;
    const trigger = event.currentTarget as HTMLElement;
    const rect = trigger.getBoundingClientRect();

    // 預設：水平置中於 trigger，垂直在 trigger 上方
    let cx = rect.left + rect.width / 2 - w / 2;
    let cy = rect.top - h - OFFSET_Y;

    // 水平溢出修正：齊左邊界 or 齊右邊界
    if (cx < MARGIN) {
      cx = MARGIN;
    } else if (cx + w > vw - MARGIN) {
      cx = vw - w - MARGIN;
    }

    // 垂直溢出修正：上方空間不足時改顯示在 trigger 下方
    if (cy < MARGIN) {
      cy = rect.bottom + OFFSET_Y;
    }

    x.value = Math.round(cx);
    y.value = Math.round(cy);
  }

  function hide(): void {
    visible.value = false;
    content.value = null;
  }

  return {
    // state
    visible,
    x,
    y,
    content,
    tooltipEl,

    // actions
    show,
    hide
  };
});
