<template>
  <canvas ref="canvas" class="mini-map"></canvas>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import type { Enemy } from '../core/gameplay/Enemy'
import type { LevelConfig } from '../core/data/types'

export default defineComponent({
  name: 'MiniMap',
  props: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    paths: { type: Array as () => LevelConfig['paths'], required: true },
    enemies: { type: Array as () => Enemy[], required: true }
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement | null>(null)

    function draw() {
      if (!canvas.value) return
      const ctx = canvas.value.getContext('2d')!
      const w = canvas.value.width
      const h = canvas.value.height
      const sx = w / props.width
      const sy = h / props.height
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = '#0f0'
      ctx.lineWidth = 2
      ctx.beginPath()
      for (const p of props.paths) {
        const pts = p.waypoints
        ctx.moveTo(pts[0].x * sx, pts[0].y * sy)
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x * sx, pts[i].y * sy)
      }
      ctx.stroke()
      ctx.fillStyle = '#f00'
      for (const e of props.enemies) {
        ctx.beginPath()
        ctx.arc(e.x * sx, e.y * sy, 2, 0, Math.PI * 2)
        ctx.fill()
      }
      requestAnimationFrame(draw)
    }

    onMounted(() => {
      if (!canvas.value) return
      canvas.value.width = props.width / 8
      canvas.value.height = props.height / 8
      draw()
    })

    watch(() => props.enemies, () => {}, { deep: true })

    return { canvas }
  }
})
</script>

<style scoped>
.mini-map { background: rgba(0,0,0,0.5); pointer-events:none; }
</style>
