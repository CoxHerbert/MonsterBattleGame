<template>
  <div class="home">

    <h1 class="logo">{{ $t('home.title') }}</h1>
    <div class="buttons">
      <button @click="start">{{ $t('home.start') }}</button>
      <button v-if="saves.length" @click="openSaves">{{ $t('home.continue') }}</button>
      <button @click="openSettings">{{ $t('home.settings') }}</button>
    </div>
    <div class="board" v-if="scores.length">
      <h2>{{ $t('home.leaderboard') }}</h2>
      <ol>
        <li v-for="(s,i) in scores" :key="i">{{ $t('home.rank', { n: i+1, score: s.score }) }}</li>
      </ol>
    </div>
    <div class="saves" v-if="savesOpen">
      <h2>{{ $t('home.selectSave') }}</h2>
      <ul>
        <li v-for="s in saves" :key="s.id"><button @click="continueGame(s.id)">{{ $t('home.saveItem', { wave: s.state.wave, score: s.state.score }) }}</button></li>
      </ul>
      <button @click="savesOpen=false">{{ $t('home.close') }}</button>
    </div>
    <SettingsDialog v-if="settingsOpen" @close="settingsOpen=false" />
  </div>
</template>

<script>
import SettingsDialog from '../components/SettingsDialog.vue'

export default {
  name: 'HomeView',
  components: { SettingsDialog },
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
