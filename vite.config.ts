import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Qoder Sites 的打包器会把压缩产物里 `pt-` / `jt-` 开头的片段当成令牌并拒绝上传
// （esbuild 重命名出的短变量恰好会拼出这种串），所以这里改用 terser 且关闭标识符重命名。
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      mangle: false,
      compress: true,
      format: { comments: false },
    },
  },
});
