<template>
  <div class="home">
    <h1 class="logo">Monster Battle</h1>
    <div class="buttons">
      <button @click="start">开始游戏</button>
      <button @click="toggleSettings">{{ settingsOpen ? '关闭设置' : '设置' }}</button>
    </div>
    <SettingsPanel v-if="settingsOpen" />
  </div>
</template>

<script>
import SettingsPanel from '../components/SettingsPanel.vue'

export default {
  name: 'HomeView',
  components: { SettingsPanel },
  data() {
    return { settingsOpen: false }
  },
  methods: {
    start() { this.$router.push('/game') },
    toggleSettings() { this.settingsOpen = !this.settingsOpen }
  }
}
</script>

<style scoped>
.home{display:flex;flex-direction:column;justify-content:center;align-items:center;width:100%;height:100vh;background:#0e0f12;color:#fff;gap:20px;}
.buttons{display:flex;gap:12px;}
button{background:#1f2937;color:#e5e7eb;border:0;padding:8px 16px;border-radius:10px;cursor:pointer;}
button:hover{filter:brightness(1.1);}
.logo{font-size:48px;}
</style>
