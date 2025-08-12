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
import { SvgAssets, TowerSpriteMap, TowerBasePad } from '../core/engine/SvgAssets'
import { buildTileLayer, drawLane } from '../core/engine/Tilemap'
import { Container } from 'pixi.js'
import { Fx } from '../core/fx/FxSystem'

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
      towers: towersData as TowerDef[],
      mouseX: 0,
      mouseY: 0
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
    window.removeEventListener('keydown', this.handleFxKeys)
    this.$refs.canvas?.removeEventListener('pointermove', this.trackMouse as any)
    game.destroy()
  },
  methods: {
    async setup() {
      const canvas = this.$refs.canvas as HTMLCanvasElement
      await Promise.all([
        Assets.load(),
        SvgAssets.preload([TowerBasePad, ...Object.values(TowerSpriteMap)])
      ])
      game.init(canvas, this.level, {
        gold: v => (this.gold = v),
        life: v => (this.life = v),
        wave: v => (this.wave = v),
        enemies: list => (this.enemies = list)
      })
      Fx.init(game.renderer.app, game.renderer.app.stage)
      Fx.setIntensity(this.$store.state.settings.fxIntensity)
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
      canvas.addEventListener('pointermove', this.trackMouse)
      window.addEventListener('keydown', this.handleFxKeys)

      const ts = this.level.tileSize
      game.towers.placeTower('arrow', ts * 4, ts * 6)
      game.towers.placeTower('cannon', ts * 6, ts * 6)
      game.towers.placeTower('ice', ts * 8, ts * 6)
      game.towers.placeTower('tesla', ts * 10, ts * 6)

      const arrow = game.towers.towers.find(t => t.id === 'arrow')
      if (arrow) {
        setTimeout(() => {
          game.towers.setTowerColor(arrow.uid, '#ef4444')
        }, 1000)
      }
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
    restart() { location.reload() },
    trackMouse(e: PointerEvent) {
      this.mouseX = e.offsetX
      this.mouseY = e.offsetY
    },
    handleFxKeys(e: KeyboardEvent) {
      const key = e.key.toLowerCase()
      if (key === 'b') {
        Fx.shockwave(this.mouseX, this.mouseY)
      } else if (key === 't') {
        const list = this.enemies
        if (list.length > 1) {
          const a = list[Math.floor(Math.random() * list.length)]
          const b = list[Math.floor(Math.random() * list.length)]
          Fx.chainLightning({ x: a.x, y: a.y }, { x: b.x, y: b.y })
        }
      } else if (key === 'g') {
        let nearest: any = null
        let min = Infinity
        for (const e of this.enemies) {
          const dx = e.x - this.mouseX
          const dy = e.y - this.mouseY
          const d = Math.hypot(dx, dy)
          if (d < min) {
            min = d
            nearest = e
          }
        }
        if (nearest) Fx.laser({ x: this.mouseX, y: this.mouseY }, { x: nearest.x, y: nearest.y })
      }
    }
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
