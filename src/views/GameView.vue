<template>
  <div class="td-wrapper">
    <div class="hud">
      <div>Gold: {{ gold }} Lives: {{ lives }} Wave: {{ wave + 1 }}</div>
      <div class="controls">
        <button v-if="phase === 'build'" @click="startWave">Start Wave</button>
        <button @click="togglePause">{{ paused ? 'Resume' : 'Pause' }}</button>
        <button @click="toggleSpeed">Speed: {{ speed }}x</button>
      </div>
    </div>
    <canvas ref="canvas" class="td-canvas" @click="placeTower"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import type { LevelConfig } from '../core/data/types'
import level1 from '../core/data/levels/level01.json'
import { Enemy } from '../core/gameplay/Enemy'
import { Tower, type TowerStats } from '../core/gameplay/Tower'
import { applyDamage } from '../core/gameplay/DamageSystem'

export default defineComponent({
  name: 'GameView',
  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null)
    const cfg: LevelConfig = level1 as LevelConfig

    const gold = ref(cfg.startGold)
    const lives = ref(cfg.startLives)
    const wave = ref(0)
    const phase = ref<'build' | 'wave'>('build')
    const speed = ref(1)
    const paused = ref(false)

    const towers: Tower[] = []
    const enemies: Enemy[] = []

    const pathSet = new Set(cfg.path.map(p => `${p.x},${p.y}`))
    const basicTower: TowerStats = {
      range: cfg.tileSize * 2,
      fireRate: 1,
      damage: 1,
      damageType: 'physical',
      cost: 5
    }

    let eventIndex = 0
    let spawnCount = 0
    let spawnTimer = 0
    let last = performance.now()

    function toggleSpeed() {
      speed.value = speed.value === 1 ? 3 : 1
    }

    function togglePause() {
      paused.value = !paused.value
    }

    function placeTower(e: MouseEvent) {
      if (phase.value !== 'build' || !canvas.value) return
      const rect = canvas.value.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.left) / cfg.tileSize)
      const y = Math.floor((e.clientY - rect.top) / cfg.tileSize)
      if (gold.value < basicTower.cost) return
      const key = `${x},${y}`
      if (pathSet.has(key) || towers.find(t => t.x === x && t.y === y)) return
      towers.push(new Tower(x, y, { ...basicTower }))
      gold.value -= basicTower.cost
    }

    function startWave() {
      if (phase.value !== 'build') return
      phase.value = 'wave'
      eventIndex = 0
      spawnCount = 0
      spawnTimer = 0
    }

    const enemyTypes: Record<string, { hp: number; armor: number; moveSpeed: number; bounty: number }> = {
      basic: { hp: 3, armor: 0, moveSpeed: 60, bounty: 1 },
      elite: { hp: 10, armor: 1, moveSpeed: 50, bounty: 5 }
    }

    function spawnEnemy(type: string) {
      const cfgE = enemyTypes[type] || enemyTypes.basic
      enemies.push(new Enemy(cfg.path, cfg.tileSize, cfgE))
    }

    function update(dt: number) {
      if (phase.value === 'wave') {
        const waveCfg = cfg.waves[wave.value]
        const ev = waveCfg?.events[eventIndex]
        if (ev) {
          spawnTimer += dt
          if (spawnCount < ev.count && spawnTimer >= ev.interval) {
            spawnEnemy(ev.type)
            spawnCount++
            spawnTimer = 0
          }
          if (spawnCount >= ev.count && enemies.length === 0) {
            eventIndex++
            spawnCount = 0
            spawnTimer = 0
          }
        } else if (waveCfg && enemies.length === 0) {
          wave.value++
          phase.value = 'build'
        }
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i]
        enemy.update(dt)
        if (enemy.seg >= cfg.path.length - 1) {
          enemies.splice(i, 1)
          lives.value--
        }
      }

      for (const t of towers) {
        t.cooldown -= dt
        if (t.cooldown <= 0) {
          const tx = t.x * cfg.tileSize + cfg.tileSize / 2
          const ty = t.y * cfg.tileSize + cfg.tileSize / 2
          const target = enemies.find(e => Math.hypot(e.x - tx, e.y - ty) <= t.stats.range)
          if (target) {
            applyDamage(target, { amount: t.stats.damage, type: t.stats.damageType })
            t.cooldown = 1 / t.stats.fireRate
            if (target.hp <= 0) {
              const idx = enemies.indexOf(target)
              enemies.splice(idx, 1)
              gold.value += target.bounty
            }
          }
        }
      }
    }

    function drawGrid(ctx: CanvasRenderingContext2D) {
      ctx.strokeStyle = '#333'
      for (let i = 0; i <= cfg.cols; i++) {
        const x = i * cfg.tileSize
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, cfg.rows * cfg.tileSize)
        ctx.stroke()
      }
      for (let j = 0; j <= cfg.rows; j++) {
        const y = j * cfg.tileSize
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(cfg.cols * cfg.tileSize, y)
        ctx.stroke()
      }
    }

    function drawPath(ctx: CanvasRenderingContext2D) {
      ctx.strokeStyle = '#ff0'
      ctx.lineWidth = 4
      ctx.beginPath()
      const start = cfg.path[0]
      ctx.moveTo(start.x * cfg.tileSize + cfg.tileSize / 2, start.y * cfg.tileSize + cfg.tileSize / 2)
      for (let i = 1; i < cfg.path.length; i++) {
        const p = cfg.path[i]
        ctx.lineTo(p.x * cfg.tileSize + cfg.tileSize / 2, p.y * cfg.tileSize + cfg.tileSize / 2)
      }
      ctx.stroke()
      ctx.lineWidth = 1
    }

    function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
      ctx.fillStyle = '#f00'
      ctx.beginPath()
      ctx.arc(enemy.x, enemy.y, 10, 0, Math.PI * 2)
      ctx.fill()
    }

    function drawTower(ctx: CanvasRenderingContext2D, tower: Tower) {
      ctx.fillStyle = '#0ff'
      ctx.fillRect(tower.x * cfg.tileSize + 8, tower.y * cfg.tileSize + 8, cfg.tileSize - 16, cfg.tileSize - 16)
    }

    function render(ctx: CanvasRenderingContext2D) {
      ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height)
      drawGrid(ctx)
      drawPath(ctx)
      for (const t of towers) drawTower(ctx, t)
      for (const e of enemies) drawEnemy(ctx, e)
    }

    onMounted(() => {
      if (!canvas.value) return
      const ctx = canvas.value.getContext('2d')!
      canvas.value.width = cfg.cols * cfg.tileSize
      canvas.value.height = cfg.rows * cfg.tileSize
      drawGrid(ctx)
      drawPath(ctx)

      const loop = (now: number) => {
        const dt = ((now - last) / 1000) * (paused.value ? 0 : speed.value)
        last = now
        update(dt)
        render(ctx)
        requestAnimationFrame(loop)
      }
      requestAnimationFrame(loop)
    })

    return { canvas, gold, lives, wave, phase, speed, paused, startWave, toggleSpeed, togglePause, placeTower }
  }
})
</script>

<style scoped>
.td-wrapper { display: flex; flex-direction: column; align-items: center; color: #fff; }
.hud { display: flex; gap: 12px; margin-bottom: 8px; }
.controls button { margin-left: 4px; }
.td-canvas { background: #0e0f12; width: 640px; height: 640px; }
</style>
