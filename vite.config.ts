import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/alpJom/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    tsconfigPaths: true, // Vite 8 內建，讀取 tsconfig 的 paths
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
