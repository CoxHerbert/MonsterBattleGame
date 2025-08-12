<template>
  <div class="game-view">
    <canvas ref="canvas" class="td-canvas"></canvas>
    <HudBar
      :gold="gold"
      :life="life"
      :wave="wave"
      :running="gameRunning"
      :paused="gamePaused"
      @start="startWave"
      @toggle-pause="togglePause"
      @speed="setSpeed"
      @open-settings="openSettings"
    />
    <TowerPanel
      class="tower-panel"
      :towers="towers"
      :gold="gold"
      :selected="selectedTower"
      @select="selectTower"
    />
    <MiniMap
      v-if="minimapOpen"
      class="mini-map"
      :width="level.width"
      :height="level.height"
      :paths="level.paths"
      :enemies="enemies"
    />
    <SettingsDialog
      v-if="showSettings"
      @close="closeSettings"
      @restart="restart"
    />
  </div>
</template>

<script lang="ts">
import HudBar from '../components/HudBar.vue'
import TowerPanel from '../components/TowerPanel.vue'
import MiniMap from '../components/MiniMap.vue'
import SettingsDialog from '../components/SettingsDialog.vue'
import { game } from '../core/engine/Game'
import level from '../core/data/levels/level01.json'
import towersData from '../core/data/towers.json'
import type { LevelConfig, TowerDef } from '../core/data/types'
import { Assets } from '../core/engine/Assets'
import { buildTileLayer, drawLane } from '../core/engine/Tilemap'
import { Container } from 'pixi.js'

export default {
  name: 'GameView',
  components: { HudBar, TowerPanel, MiniMap, SettingsDialog },
  data() {
    return {
      gold: 0,
      life: 0,
      wave: 1,
      showSettings: false,
      selectedTower: null as string | null,
      enemies: [] as any[],
      level: level as LevelConfig,
      towers: towersData as TowerDef[]
    }
  },
  computed: {
    minimapOpen() { return this.$store.state.settings.minimapOpen },
    gameRunning() { return game.running },
    gamePaused() { return game.paused }
  },
  mounted() {
    this.setup()
  },
  beforeUnmount() {
    game.destroy()
  },
  methods: {
    async setup() {
      const canvas = this.$refs.canvas as HTMLCanvasElement
      await Assets.load()
      game.init(canvas, this.level, {
        gold: v => (this.gold = v),
        life: v => (this.life = v),
        wave: v => (this.wave = v),
        enemies: list => (this.enemies = list)
      })
      const tileLayer = new Container()
      game.renderer.app.stage.addChildAt(tileLayer, 1)
      const grid = Array.from({ length: 22 }, () => Array(40).fill(0))
      for (let x = 2; x < 38; x++) grid[10][x] = 1
      for (let y = 10; y < 20; y++) grid[y][38] = 1
      for (let x = 38; x > 10; x--) grid[20][x] = 1
      for (let y = 20; y > 5; y--) grid[y][10] = 1
      for (let x = 10; x < 30; x++) grid[5][x] = 1
      buildTileLayer(grid, tileLayer)
      drawLane(game.renderer.laneLayer, this.level.paths[0].waypoints)
    },
    startWave() { game.startNextWave() },
    togglePause() { game.togglePause() },
    setSpeed(s: number) { game.setSpeed(s) },
    selectTower(id: string | null) {
      this.selectedTower = id
      game.setBuildTower(id)
    },
    openSettings() {
      this.showSettings = true
      game.pause()
    },
    closeSettings() {
      this.showSettings = false
      game.resume()
    },
    restart() { location.reload() }
  }
}
</script>

<style scoped>
.game-view { position: relative; width: 100%; height: 100%; }
.td-canvas { background: #0e0f12; display:block; margin:0 auto; }
.hud-bar { position:absolute; top:0; left:0; right:0; }
.tower-panel { position:absolute; left:0; top:50px; }
.mini-map { position:absolute; right:0; bottom:0; }
</style>
