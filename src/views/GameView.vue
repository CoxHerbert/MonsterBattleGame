<template>
  <div class="td-wrapper">
    <div class="hud">
      <div>Gold: {{ economy.gold }} Life: {{ life }} Wave: {{ wave }}</div>
      <button @click="startWave" :disabled="running">Start Wave</button>
    </div>
    <canvas ref="canvas" class="td-canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import level1 from '../core/data/levels/level01.json'
import enemiesData from '../core/data/enemies.json'
import { EnemyManager } from '../core/gameplay/EnemyManager'
import { WaveManager } from '../core/gameplay/WaveManager'
import { Economy } from '../core/gameplay/Economy'
import { bindEnemyManager } from '../core/gameplay/Targeting'
import type { LevelConfig, EnemyDef } from '../core/data/types'

export default defineComponent({
  name: 'GameView',
  setup() {
    const cfg = level1 as LevelConfig
    const canvas = ref<HTMLCanvasElement | null>(null)
    const economy = new Economy()
    economy.gain(cfg.startGold)
    const life = ref(cfg.startLife)
    const wave = ref(1)

    const defs: Record<string, EnemyDef> = {}
    for (const d of enemiesData as EnemyDef[]) defs[d.id] = d
    const enemies = new EnemyManager(cfg, defs, () => { life.value-- })
    bindEnemyManager(enemies)
    const waves = new WaveManager(enemies)
    waves.init(cfg)

    const running = ref(false)

    function startWave() {
      if (!waves.isWaveRunning()) {
        waves.startNextWave()
        running.value = true
      }
    }

    onMounted(() => {
      if (!canvas.value) return
      const ctx = canvas.value.getContext('2d')!
      canvas.value.width = cfg.width
      canvas.value.height = cfg.height

      const drawGrid = () => {
        const cols = cfg.width / cfg.tileSize
        const rows = cfg.height / cfg.tileSize
        ctx.strokeStyle = '#333'
        for (let i = 0; i <= cols; i++) {
          const x = i * cfg.tileSize
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, cfg.height)
          ctx.stroke()
        }
        for (let j = 0; j <= rows; j++) {
          const y = j * cfg.tileSize
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(cfg.width, y)
          ctx.stroke()
        }
      }

      const drawPaths = () => {
        ctx.strokeStyle = '#ff0'
        ctx.lineWidth = 4
        for (const p of cfg.paths) {
          const wps = p.waypoints
          ctx.beginPath()
          ctx.moveTo(wps[0].x, wps[0].y)
          for (let i = 1; i < wps.length; i++) ctx.lineTo(wps[i].x, wps[i].y)
          ctx.stroke()
        }
        ctx.lineWidth = 1
      }

      const drawEnemies = () => {
        ctx.fillStyle = '#f00'
        enemies.forEach(e => {
          ctx.beginPath()
          ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      let last = performance.now()
      const loop = (now: number) => {
        const dt = (now - last) / 1000
        last = now
        waves.update(dt)
        enemies.update(dt)
        if (!waves.isWaveRunning()) running.value = false
        wave.value = waves.currentWave + 1
        ctx.clearRect(0, 0, cfg.width, cfg.height)
        drawGrid()
        drawPaths()
        drawEnemies()
        requestAnimationFrame(loop)
      }
      requestAnimationFrame(loop)
    })

    return { canvas, economy, life, wave, startWave, running }
  }
})
</script>

<style scoped>
.td-wrapper { display: flex; flex-direction: column; align-items: center; color: #fff; }
.hud { margin-bottom: 8px; }
.td-canvas { background: #0e0f12; }
</style>
