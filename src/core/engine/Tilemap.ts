import { Container, Graphics, Sprite } from 'pixi.js'
import { Assets } from './Assets'

export function buildTileLayer(grid: number[][], container: Container) {
  container.removeChildren()
  const rows = grid.length
  const cols = grid[0].length
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = grid[y][x]
      let frame = 'GROUND'
      if (v === 1) {
        const up = y > 0 && grid[y - 1][x] === 1
        const right = x < cols - 1 && grid[y][x + 1] === 1
        const down = y < rows - 1 && grid[y + 1][x] === 1
        const left = x > 0 && grid[y][x - 1] === 1
        const mask = (up ? 1 : 0) | (right ? 2 : 0) | (down ? 4 : 0) | (left ? 8 : 0)
        frame = `ROAD_${mask}`
      }
      const sp = new Sprite(Assets.texture(frame))
      sp.anchor.set(0)
      sp.position.set(x * 32, y * 32)
      container.addChild(sp)
    }
  }
}

export function drawLane(container: Container, waypoints: { x: number; y: number }[]) {
  container.removeChildren()
  const g = new Graphics()
  g.lineStyle(2, 0xff00ff, 1)
  const dash = 12
  const gap = 8
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i]
    const b = waypoints[i + 1]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy)
    const ang = Math.atan2(dy, dx)
    let dist = 0
    while (dist < len) {
      const sx = a.x + Math.cos(ang) * dist
      const sy = a.y + Math.sin(ang) * dist
      dist += dash
      if (dist > len) dist = len
      const ex = a.x + Math.cos(ang) * dist
      const ey = a.y + Math.sin(ang) * dist
      g.moveTo(sx, sy)
      g.lineTo(ex, ey)
      dist += gap
    }
  }
  const end = waypoints[waypoints.length - 1]
  const prev = waypoints[waypoints.length - 2]
  const ang = Math.atan2(end.y - prev.y, end.x - prev.x)
  g.beginFill(0xff00ff)
  g.drawPolygon([
    end.x,
    end.y,
    end.x - 10 * Math.cos(ang - Math.PI / 6),
    end.y - 10 * Math.sin(ang - Math.PI / 6),
    end.x - 10 * Math.cos(ang + Math.PI / 6),
    end.y - 10 * Math.sin(ang + Math.PI / 6)
  ])
  g.endFill()
  container.addChild(g)
}
