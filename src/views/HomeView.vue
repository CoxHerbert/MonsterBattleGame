<template>
  <div class="home">
    <h1 class="logo">怪物大战</h1>
    <div class="buttons">
      <button @click="start">开始游戏</button>
      <button v-if="saves.length" @click="openSaves">继续游戏</button>
      <button @click="openSettings">设置</button>
    </div>
    <div class="board" v-if="scores.length">
      <h2>排行榜</h2>
      <ol>
        <li v-for="(s,i) in scores" :key="i">第{{ i+1 }}名：{{ s.score }}</li>
      </ol>
    </div>
    <div class="saves" v-if="savesOpen">
      <h2>选择存档</h2>
      <ul>
        <li v-for="s in saves" :key="s.id"><button @click="continueGame(s.id)">波数{{ s.state.wave }} 分数{{ s.state.score }}</button></li>
      </ul>
      <button @click="savesOpen=false">关闭</button>
    </div>
    <SettingsPanel v-if="settingsOpen" @close="settingsOpen=false" />
  </div>
</template>

<script>
import SettingsPanel from '../components/SettingsPanel.vue'

export default {
  name: 'HomeView',
  components: { SettingsPanel },
  data() {
    return { settingsOpen: false, savesOpen: false }
  },
  computed: {
    saves() { return JSON.parse(localStorage.getItem('saves') || '[]') },
    scores() { return JSON.parse(localStorage.getItem('scores') || '[]').sort((a,b)=>b.score-a.score).slice(0,10) }
  },
  methods: {
    start() { this.$router.push('/game') },
    openSettings() { this.settingsOpen = true },
    openSaves() { this.savesOpen = true },
    continueGame(id) { this.$router.push({ path: '/game', query: { save: id } }) }
  }
}
</script>

<style scoped>
.home{display:flex;flex-direction:column;justify-content:center;align-items:center;width:100%;height:100vh;background:#0e0f12;color:#fff;gap:20px;}
.buttons{display:flex;gap:12px;}
button{background:#1f2937;color:#e5e7eb;border:0;padding:8px 16px;border-radius:10px;cursor:pointer;}
button:hover{filter:brightness(1.1);}
.logo{font-size:48px;}
.board{margin-top:20px;color:#e5e7eb;}
.board ol{padding-left:20px;}
.saves{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(31,41,55,.95);padding:20px;border-radius:12px;display:flex;flex-direction:column;gap:12px;align-items:center;}
.saves ul{list-style:none;padding:0;display:flex;flex-direction:column;gap:8px;}
.saves button{width:100%;}
</style>
