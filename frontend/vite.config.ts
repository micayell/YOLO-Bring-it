import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "window", // ✅ SockJS global 참조 오류 해결을 위한 수정
  },
  server: {
    port: 3000, // 백엔드 CORS 설정에 맞춤
  },
});