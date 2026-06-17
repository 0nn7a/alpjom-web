import { computed, ref, watch } from 'vue';
import type { FieldRule } from '@/types/form.ts';

export function useFormValidation<T extends Record<string, string>>(
  form: T,
  rules: Partial<Record<keyof T, FieldRule>>
) {
  const errors = ref<Partial<Record<keyof T, string>>>({});
  const submitAttempted = ref(false);

  const requires = computed(() => {
    const result: Partial<Record<keyof T, boolean>> = {};

    for (const key in rules) {
      const rule = rules[key];

      result[key] =
        typeof rule?.required === 'function'
          ? rule.required(form)
          : rule?.required;
    }

    return result;
  });

  const validate = (): boolean => {
    let ok = true;

    for (const key in rules) {
      const rule = rules[key];
      const value = form[key];

      const required = requires.value[key];

      if (required && !value) {
        errors.value[key] = '*必填欄位';
        ok = false;
        continue;
      }

      if (value && rule?.pattern && !rule.pattern.regex.test(value)) {
        errors.value[key] = rule.pattern.message;
        ok = false;
        continue;
      }

      errors.value[key] = '';
    }
    return ok;
  };

  const handleSubmit = (callback: () => void) => {
    submitAttempted.value = true;
    if (validate()) callback();
  };

  watch(
    () => ({ ...form }),
    () => {
      if (submitAttempted.value) validate();
    },
    { deep: true }
  );

  return {
    requires,
    errors,
    submitAttempted,
    handleSubmit
  };
}
