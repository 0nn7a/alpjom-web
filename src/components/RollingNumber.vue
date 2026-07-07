<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  value: number;
}>();

const direction = ref<'up' | 'down'>('up');

const digits = computed(() => {
  const str = String(props.value);
  return str.split('').map((digit, i) => ({
    key: str.length - 1 - i,
    digit
  }));
});

watch(
  () => props.value,
  (newVal, oldVal) => {
    direction.value = newVal > oldVal ? 'up' : 'down';
  }
);
</script>

<template>
  <div class="rolling-number">
    <TransitionGroup :name="`slot-${direction}`">
      <div v-for="item in digits" :key="item.key" class="digit-slot">
        <Transition :name="`roll-${direction}`">
          <span :key="item.digit" class="digit">{{ item.digit }}</span>
        </Transition>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.rolling-number {
  display: inline-flex;
  line-height: 1;
}

.digit-slot {
  position: relative;
  overflow: hidden;
  height: 1em;
  width: 1ch;
  display: inline-block;
  text-align: center;
}

.digit {
  display: block;
}

/* digit-slot 新增（進位） */
.slot-up-enter-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
  overflow: hidden;
}
.slot-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

/* digit-slot 消失（借位） */
.slot-down-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease,
    width 0.25s ease;
  overflow: hidden;
  width: 1ch;
}
.slot-down-leave-to {
  transform: translateY(100%);
  opacity: 0;
  width: 0;
}

/* 數字滾動共用 */
.roll-up-enter-active,
.roll-down-enter-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.roll-up-leave-active,
.roll-down-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

/* 向上（+1）*/
.roll-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.roll-up-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* 向下（-1）*/
.roll-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}
.roll-down-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
