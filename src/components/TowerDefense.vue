<template>
  <canvas ref="canvas" class="td-canvas"></canvas>
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
}

export default defineComponent({
  name: 'TowerDefense',
  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null)

    onMounted(() => {
      if (!canvas.value) return
      const cfg: LevelConfig = level1
      const ctx = canvas.value.getContext('2d')!
      canvas.value.width = cfg.cols * cfg.tileSize
      canvas.value.height = cfg.rows * cfg.tileSize

      const enemy: Enemy = {
        x: cfg.path[0].x * cfg.tileSize + cfg.tileSize / 2,
        y: cfg.path[0].y * cfg.tileSize + cfg.tileSize / 2,
        speed: 100,
        seg: 0
      }
      let last = performance.now()

      function drawGrid() {
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

      function drawPath() {
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

      function drawEnemy() {
        ctx.fillStyle = '#f00'
        ctx.beginPath()
        ctx.arc(enemy.x, enemy.y, 10, 0, Math.PI * 2)
        ctx.fill()
      }

      function update(dt: number) {
        const next = cfg.path[enemy.seg + 1]
        if (!next) return
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
      }

      function render() {
        ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height)
        drawGrid()
        drawPath()
        drawEnemy()
      }

      function loop(now: number) {
        const dt = (now - last) / 1000
        last = now
        update(dt)
        render()
        requestAnimationFrame(loop)
      }

      drawGrid()
      drawPath()
      drawEnemy()
      requestAnimationFrame(loop)
    })

    return { canvas }
  }
})
</script>

<style scoped>
.td-canvas {
  background: #0e0f12;
  width: 640px;
  height: 640px;
}
</style>
