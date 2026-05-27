<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';
import FormInput from '@/components/FormInput.vue';
import type { LoginRequest, RegisterRequest } from '@/types/auth';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.ts';
import { ApiError } from '@/types/common.ts';
import { useToastStore } from '@/stores/toast';

const authStore = useAuthStore();
const toastStore = useToastStore();

const router = useRouter();
const route = useRoute();
const routeName = computed(() => route.name);

const isLogin = computed(() => routeName.value === 'login');
const action = computed(() => (isLogin.value ? 'Login' : 'Register'));
const direct = computed(() => (isLogin.value ? 'register' : 'login'));
const hint = computed(() =>
  isLogin.value
    ? 'New to alpJom? Create an account.'
    : 'Already have an account? Go to login.'
);

type AuthFormData = {
  email: string;
  username: string;
  password: string;
};

const formData = reactive<AuthFormData>({
  email: '',
  username: '',
  password: ''
});

type FieldKey = keyof AuthFormData;
type RequiredRule = boolean | ((form: AuthFormData) => boolean);
type FieldRule = {
  required?: RequiredRule;
  pattern?: {
    regex: RegExp;
    message: string;
  };
};

const fieldRules = {
  email: {
    required: true,
    pattern: {
      regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: 'Email format error.'
    }
  },
  password: {
    required: true,
    pattern: {
      regex: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':",.<>/?`~]{4,}$/,
      message: 'More than 3 chars, special allowed.'
    }
  },
  username: {
    required: true,
    pattern: {
      regex: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':",.<>/?`~]{5,}$/,
      message: 'More than 4 chars, special allowed.'
    }
  }
} satisfies Record<FieldKey, FieldRule>;

const pwdHide = ref(false);
const pwdType = computed(() => (pwdHide.value ? 'text' : 'password'));

const submitAttempted = ref(false);

const resolveRequired = (rule: FieldRule) => {
  if (typeof rule.required === 'function') return rule.required(formData);
  return rule.required ?? false;
};

const validateField = (value: string, rule: FieldRule) => {
  const isRequired = resolveRequired(rule);

  if (!value) return isRequired ? 'Required field.' : '';
  if (rule.pattern && !rule.pattern.regex.test(value))
    return rule.pattern.message;
  return '';
};

const errors = computed(() => {
  return {
    email: validateField(formData.email, fieldRules.email),
    password: validateField(formData.password, fieldRules.password),
    username: isLogin.value
      ? ''
      : validateField(formData.username, fieldRules.username)
  };
});
const requiredMarks = computed(() => {
  return {
    email: resolveRequired(fieldRules.email),
    password: resolveRequired(fieldRules.password),
    username: resolveRequired(fieldRules.username)
  };
});
const isFormValid = computed(() => {
  return (
    !errors.value.email && !errors.value.password && !errors.value.username
  );
});
const handleSubmit = async () => {
  submitAttempted.value = true;
  if (!isFormValid.value) return;

  try {
    if (isLogin.value) {
      const loginRequest: LoginRequest = {
        email: formData.email,
        password: formData.password
      };
      await authStore.login(loginRequest);

      // 自動導向到被阻擋至登入前那一頁
      toastStore.notify('登入成功！\n歡迎來到 alpJom！', {
        tone: 'success'
      });
      const redirect = route.query.redirect;
      await router.push(
        typeof redirect === 'string' ? redirect : { name: 'home' }
      );
    } else {
      const registerRequest: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        username: formData.username
      };
      await authStore.register(registerRequest);
      toastStore.notify('註冊成功！請嘗試登入！', {
        tone: 'success'
      });
      await router.push({ name: 'login' });
    }
  } catch (err) {
    if (err instanceof ApiError)
      toastStore.notify(err.message, { tone: 'error' });
  }
};
</script>

<template>
  <section class="my-auto flex flex-col justify-center items-center">
    <h1 class="font-semibold text-3xl">alpJom</h1>
    <form
      id="auth-form"
      class="w-60 flex flex-col gap-x-4 gap-y-0.5 my-10"
      @submit.prevent="handleSubmit"
    >
      <FormInput
        title="Email"
        placeholder="text@mail.com"
        v-model="formData.email"
        :error="errors.email"
        :showError="submitAttempted"
        :required="requiredMarks.email"
      />

      <FormInput
        title="Password"
        :type="pwdType"
        v-model="formData.password"
        :error="errors.password"
        :showError="submitAttempted"
        :required="requiredMarks.password"
        lblClass="mt-3"
      >
        <template #right>
          <Component
            :is="pwdHide ? EyeIcon : EyeSlashIcon"
            @click="pwdHide = !pwdHide"
            class="h-5 ms-2 text-neutral-400 rounded-md cursor-pointer transition duration-300 hover:text-neutral-700"
          />
        </template>
      </FormInput>

      <FormInput
        v-if="!isLogin"
        title="Username"
        v-model="formData.username"
        :error="errors.username"
        :showError="submitAttempted"
        :required="requiredMarks.username"
        lblClass="mt-3"
      >
        <template #left>
          <p class="text-neutral-400 -translate-y-px">@</p>
        </template>
      </FormInput>
    </form>

    <button
      type="submit"
      form="auth-form"
      class="text-xl py-2 px-4 bg-neutral-100 border border-neutral-300 rounded-md cursor-pointer transition duration-300 hover:border-neutral-400"
    >
      {{ action }}
    </button>
    <RouterLink
      :to="{ name: direct }"
      class="mt-3 text-sm text-neutral-400 transition duration-300 hover:text-neutral-600"
    >
      → {{ hint }}
    </RouterLink>
  </section>
</template>
