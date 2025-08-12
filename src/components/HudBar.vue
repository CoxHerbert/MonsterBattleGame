<template>
  <div class="hud-bar">
    <div class="stats">
      <span>💰 {{ gold }}</span>
      <span>❤️ {{ life }}</span>
      <span>Wave {{ wave }}</span>
    </div>
    <div class="controls">
      <button @click="$emit('start')" :disabled="running">Start</button>
      <button @click="$emit('toggle-pause')">{{ paused ? 'Resume' : 'Pause' }}</button>
      <button @click="$emit('speed',1)">1x</button>
      <button @click="$emit('speed',2)">2x</button>
      <button @click="$emit('speed',3)">3x</button>
      <button @click="$emit('open-settings')">⚙️</button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'HudBar',
  props: {
    gold: { type: Number, required: true },
    life: { type: Number, required: true },
    wave: { type: Number, required: true },
    running: { type: Boolean, required: true },
    paused: { type: Boolean, required: true }
  }
}
</script>

<style scoped>
.hud-bar { display:flex; justify-content:space-between; align-items:center; padding:4px; background:rgba(0,0,0,0.6); pointer-events:auto; }
.stats span { margin-right:8px; }
.controls button { margin-right:4px; }
</style>
