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
import towersData from '../core/data/towers.json'
import { EnemyManager } from '../core/gameplay/EnemyManager'
import { WaveManager } from '../core/gameplay/WaveManager'
import { Economy } from '../core/gameplay/Economy'
import { bindEnemyManager } from '../core/gameplay/Targeting'
import { TowerManager } from '../core/gameplay/TowerManager'
import { Renderer } from '../core/engine/Renderer'
import { Input } from '../core/engine/Input'
import type { LevelConfig, EnemyDef, TowerDef } from '../core/data/types'

export default defineComponent({
  name: 'GameView',
  setup() {
    const cfg = level1 as LevelConfig
    const canvas = ref<HTMLCanvasElement | null>(null)
    const economy = new Economy()
    economy.gain(cfg.startGold)
    const life = ref(cfg.startLife)
    const wave = ref(1)

    const enemyDefs: Record<string, EnemyDef> = {}
    for (const d of enemiesData as EnemyDef[]) enemyDefs[d.id] = d
    const enemies = new EnemyManager(cfg, enemyDefs, () => { life.value-- })
    bindEnemyManager(enemies)
    const waves = new WaveManager(enemies)
    waves.init(cfg)

    const towerDefs: Record<string, TowerDef> = {}
    for (const t of towersData as TowerDef[]) towerDefs[t.id] = t
    const towers = new TowerManager(towerDefs)
    const selectedTower = towerDefs['arrow']

    const running = ref(false)
    const paused = ref(false)
    const speed = ref(1)

    function startWave() {
      if (!waves.isWaveRunning()) {
        waves.startNextWave()
        running.value = true
      }
    }

    onMounted(() => {
      if (!canvas.value) return
      const renderer = new Renderer()
      renderer.init(canvas.value, cfg)
      const input = new Input(canvas.value, cfg.tileSize)
      input.onPointer((gx, gy) => {
        renderer.highlightTile(gx, gy)
        const cx = gx * cfg.tileSize + cfg.tileSize / 2
        const cy = gy * cfg.tileSize + cfg.tileSize / 2
        renderer.drawRangePreview(cx, cy, selectedTower.range)
      })
      input.onRightClick(() => renderer.hideRangePreview())
      input.onClick((gx, gy) => {
        const cx = gx * cfg.tileSize + cfg.tileSize / 2
        const cy = gy * cfg.tileSize + cfg.tileSize / 2
        if (economy.spend(selectedTower.cost)) {
          towers.placeTower(selectedTower.id, cx, cy)
          renderer.drawTowers(towers.towers)
        }
      })
      input.onCommand(cmd => {
        switch (cmd) {
          case 'toggle-pause':
            paused.value = !paused.value
            break
          case 'speed1':
            speed.value = 1
            break
          case 'speed2':
            speed.value = 2
            break
          case 'speed3':
            speed.value = 3
            break
          case 'restart':
            location.reload()
            break
        }
      })

      let last = performance.now()
      const loop = (now: number) => {
        let dt = (now - last) / 1000
        last = now
        if (!paused.value) {
          dt *= speed.value
          waves.update(dt)
          enemies.update(dt)
          towers.update(dt)
          renderer.drawEnemies(enemies.enemies)
          renderer.drawTowers(towers.towers)
          if (!waves.isWaveRunning()) running.value = false
          wave.value = waves.currentWave + 1
        }
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
