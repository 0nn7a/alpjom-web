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
    :class="[showError && error ? ['text-red-600'] : ['text-neutral-600'], lblClass]"
  >
    {{ props.title }}{{ props.required ? '*' : '' }}
  </label>
  <div class="flex flex-col">
    <div
      class="flex items-center py-1.5 px-3 font-normal text-neutral-950 border border-neutral-300 rounded-lg transition duration-300 has-focus:ring-2"
      :class="[
        showError && error
          ? ['border-red-500', 'ring-red-100']
          : ['has-focus:border-neutral-400', 'ring-neutral-100'],
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
        class="flex-1 min-w-0 placeholder:text-neutral-300"
      />
      <slot name="right" />
    </div>
    <p v-if="showError && error" class="text-lg text-end text-red-400">
      {{ error }}
    </p>
  </div>
</template>

<style scoped></style>
