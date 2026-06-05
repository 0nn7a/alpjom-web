<script setup lang="ts">
interface FormInputProps {
  title?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  showError?: boolean;
  lblClass?: string;
  iptClass?: string;
}

const props = withDefaults(defineProps<FormInputProps>(), {
  title: 'Title',
  type: 'text',
  placeholder: '',
  required: false,
  error: '',
  showError: false,
  lblClass: '',
  iptClass: ''
});

const value = defineModel<string>({ default: '' });
</script>

<template>
  <label
    :for="props.title"
    class="font-normal"
    :class="[
      showError && error
        ? ['text-(--aj-color-danger)']
        : ['text-(--aj-color-muted)'],
      lblClass
    ]"
  >
    {{ props.title }}{{ props.required ? '*' : '' }}
  </label>
  <div class="flex flex-col gap-y-0.5">
    <div
      class="flex items-center py-1.5 px-3 font-normal text-(--aj-color-text) border border-(--aj-color-border) rounded-lg transition duration-300 has-focus:ring-2"
      :class="[
        showError && error
          ? [
              'border-(--aj-color-danger-border)',
              'ring-(--aj-color-danger-ring)'
            ]
          : [
              'has-focus:border-(--aj-color-border-active)',
              'ring-(--aj-color-ring)'
            ],
        iptClass
      ]"
    >
      <slot name="left" />
      <input
        :type="props.type"
        :id="props.title"
        :name="props.title"
        :placeholder="props.placeholder"
        autocomplete="off"
        v-model.trim="value"
        class="flex-1 min-w-0 placeholder:text-(--aj-color-placeholder)"
      />
      <slot name="right" />
    </div>
    <p
      v-if="showError && error"
      class="text-sm text-end text-(--aj-color-danger-muted)"
    >
      {{ error }}
    </p>
  </div>
</template>

<style scoped></style>
