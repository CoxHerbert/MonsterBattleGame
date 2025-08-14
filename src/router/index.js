import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import GameView from '@/views/GameView.vue';

const routes = [
    { path: '/', name: 'home', component: HomeView },
    // /game?mode=ENDLESS | PROGRESSION & chapterId=1-1
    { path: '/game', name: 'game', component: GameView },
];

export default createRouter({ history: createWebHashHistory('/MonsterBattleGame/'), routes });
