import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const isPages = process.env.GITHUB_PAGES === 'true';
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const base = isPages && !repo.endsWith('.github.io') ? `/${repo}/` : '/';

export default defineConfig({
    plugins: [vue()],
    base: '/MonsterBattleGame/',
    server: { host: '0.0.0.0', port: 5173, open: true },
    resolve: { alias: { '@': '/src', vuex: '/src/simple-vuex.js' } },
});
