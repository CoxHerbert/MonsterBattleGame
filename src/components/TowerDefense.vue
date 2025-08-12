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
import type { LevelConfig } from '../game/level'
import { level1 } from '../game/level'

interface Enemy {
  x: number
  y: number
  speed: number
  seg: number
  hp: number
}

interface Tower {
  x: number
  y: number
  cooldown: number
}

export default defineComponent({
  name: 'TowerDefense',
  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null)
    const gold = ref(20)
    const lives = ref(20)
    const wave = ref(0)
    const phase = ref<'build' | 'wave'>('build')
    const speed = ref(1)
    const paused = ref(false)

    const towers: Tower[] = []
    const enemies: Enemy[] = []

    const cfg: LevelConfig = level1
    const pathSet = new Set(cfg.path.map(p => `${p.x},${p.y}`))
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
      if (gold.value < 5) return
      const key = `${x},${y}`
      if (pathSet.has(key) || towers.find(t => t.x === x && t.y === y)) return
      towers.push({ x, y, cooldown: 0 })
      gold.value -= 5
    }

    function startWave() {
      if (phase.value !== 'build') return
      phase.value = 'wave'
      spawnCount = 0
      spawnTimer = 0
    }

    function spawnEnemy() {
      const start = cfg.path[0]
      enemies.push({
        x: start.x * cfg.tileSize + cfg.tileSize / 2,
        y: start.y * cfg.tileSize + cfg.tileSize / 2,
        speed: 60,
        seg: 0,
        hp: 3
      })
    }

    function update(dt: number) {
      if (phase.value === 'wave') {
        const waveCfg = cfg.waves[wave.value]
        if (waveCfg) {
          spawnTimer += dt
          if (spawnCount < waveCfg.count && spawnTimer >= waveCfg.interval) {
            spawnEnemy()
            spawnCount++
            spawnTimer = 0
          }
        }
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i]
        const next = cfg.path[enemy.seg + 1]
        if (next) {
          const tx = next.x * cfg.tileSize + cfg.tileSize / 2
          const ty = next.y * cfg.tileSize + cfg.tileSize / 2
          const dx = tx - enemy.x
          const dy = ty - enemy.y
          const dist = Math.hypot(dx, dy)
          const step = enemy.speed * dt
          if (dist <= step) {
            enemy.x = tx
            enemy.y = ty
            enemy.seg++
          } else {
            enemy.x += (dx / dist) * step
            enemy.y += (dy / dist) * step
          }
        } else {
          enemies.splice(i, 1)
          lives.value--
        }
      }

      for (const t of towers) {
        t.cooldown -= dt
        if (t.cooldown <= 0) {
          const tx = t.x * cfg.tileSize + cfg.tileSize / 2
          const ty = t.y * cfg.tileSize + cfg.tileSize / 2
          const target = enemies.find(e => Math.hypot(e.x - tx, e.y - ty) <= cfg.tileSize * 2)
          if (target) {
            target.hp--
            t.cooldown = 1
            if (target.hp <= 0) {
              const idx = enemies.indexOf(target)
              enemies.splice(idx, 1)
              gold.value += 1
            }
          }
        }
      }

      if (phase.value === 'wave') {
        const waveCfg = cfg.waves[wave.value]
        if (waveCfg && spawnCount >= waveCfg.count && enemies.length === 0) {
          wave.value++
          phase.value = 'build'
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
