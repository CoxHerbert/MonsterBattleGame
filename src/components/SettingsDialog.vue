<template>
  <div class="settings-dialog">
    <div class="audio">
      <button @click="toggleMute">{{ settings.muted ? '🔇' : '🔊' }}</button>
      <input type="range" min="0" max="1" step="0.01" v-model.number="volume" />
      <button @click="toggleBgm">{{ settings.bgmOn ? 'BGM On' : 'BGM Off' }}</button>
    </div>
    <button @click="toggleRadar">{{ settings.minimapOpen ? 'Hide Radar' : 'Show Radar' }}</button>
    <button @click="$emit('restart')">Restart</button>
    <button @click="$emit('close')">Close</button>
  </div>
</template>

<script>
export default {
  name: 'SettingsDialog',
  emits: ['close', 'restart', 'toggle-radar'],
  computed: {
    settings() { return this.$store.state.settings },
    volume: {
      get() { return this.settings.volume },
      set(v) { this.$store.commit('setVolume', v) }
    }
  },
  methods: {
    toggleMute() { this.$store.commit('setMuted', !this.settings.muted) },
    toggleBgm() { this.$store.commit('setBgmOn', !this.settings.bgmOn) },
    toggleRadar() {
      this.$store.commit('setMinimapOpen', !this.settings.minimapOpen)
      this.$emit('toggle-radar', this.settings.minimapOpen)
    }
  }
}
</script>

<style scoped>
.settings-dialog { pointer-events:auto; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); background:#222; color:#fff; padding:20px; border-radius:8px; display:flex; flex-direction:column; gap:8px; }
.audio { display:flex; align-items:center; gap:6px; }
</style>
