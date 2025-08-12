import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  server: {
    host: '0.0.0.0', // 或者直接写你的本机局域网IP
    port: 5173,      // 可自定义端口
    open: true       // 启动后自动打开浏览器
  },
  resolve: {
    alias: {
      '@': '/src',
      'vuex': '/src/simple-vuex.js'
    }
  }
})
