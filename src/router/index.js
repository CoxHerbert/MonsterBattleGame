import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GameView from '../views/GameView.vue'
import TowerDefenseView from '../views/TowerDefenseView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/game', name: 'game', component: GameView },
  { path: '/tower', name: 'tower', component: TowerDefenseView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
