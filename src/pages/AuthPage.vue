<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';
import FormInput from '@/components/FormInput.vue';
import type { LoginRequest, RegisterRequest } from '@/types/auth';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.ts';
import { ApiError } from '@/types/common.ts';
import { useToastStore } from '@/stores/toast';
import { useFormValidation } from '@/composables/useFormValidation.ts';
import {
  type FieldRule,
  EmailPattern,
  PasswordPattern,
  UsernamePattern
} from '@/types/form.js';

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

type AuthFormData = { email: string; username: string; password: string };
const formData = reactive<AuthFormData>({
  email: '',
  username: '',
  password: ''
});
const fieldRules = computed(() => {
  return {
    email: {
      required: true,
      pattern: EmailPattern
    },
    password: {
      required: true,
      pattern: PasswordPattern
    },
    username: {
      required: !isLogin.value,
      pattern: UsernamePattern
    }
  } satisfies Record<keyof AuthFormData, FieldRule>;
});

const pwdHide = ref(false);
const pwdType = computed(() => (pwdHide.value ? 'text' : 'password'));

const { requires, errors, submitAttempted, handleSubmit } = useFormValidation(
  formData,
  fieldRules.value
);

const submit = () =>
  handleSubmit(async () => {
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
  });
</script>

<template>
  <section class="w-full m-auto p-8 flex flex-col justify-center items-center">
    <h1 class="font-semibold text-3xl">alpJom</h1>
    <form
      id="auth-form"
      class="w-full flex flex-col gap-x-4 gap-y-0.5 my-10"
      @submit.prevent="submit"
    >
      <FormInput
        title="Email"
        placeholder="text@mail.com"
        v-model="formData.email"
        :error="errors.email"
        :showError="submitAttempted"
        :required="requires.email"
      />

      <FormInput
        title="Password"
        :type="pwdType"
        v-model="formData.password"
        :error="errors.password"
        :showError="submitAttempted"
        :required="requires.password"
        lblClass="mt-3"
      >
        <template #right>
          <Component
            :is="pwdHide ? EyeIcon : EyeSlashIcon"
            @click="pwdHide = !pwdHide"
            class="h-5 ms-2 text-(--aj-color-border) rounded-md cursor-pointer transition duration-300 hover:text-(--aj-color-border-active)"
          />
        </template>
      </FormInput>

      <FormInput
        v-if="!isLogin"
        title="Username"
        v-model="formData.username"
        :error="errors.username"
        :showError="submitAttempted"
        :required="requires.username"
        lblClass="mt-3"
      >
        <template #left>
          <p class="text-(--aj-color-border) -translate-y-px">@</p>
        </template>
      </FormInput>
    </form>

    <button type="submit" form="auth-form" class="btn-primary">
      {{ action }}
    </button>
    <RouterLink
      :to="{ name: direct }"
      class="mt-3 text-sm text-(--aj-color-subtle) transition duration-300 hover:text-(--aj-color-muted)"
    >
      → {{ hint }}
    </RouterLink>
  </section>
</template>
