import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Game3DView from '../views/Game3DView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/game', name: 'game', component: Game3DView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
