import type { TowerDef } from '../data/types'
import { Enemy } from './Enemy'

interface Projectile {
  x: number
  y: number
  target: Enemy
  speed: number
  def: TowerDef
  ownerId: string
}

export class ProjectileManager {
  projectiles: Projectile[] = []

  fire(from: { x: number; y: number }, toEnemy: Enemy, def: TowerDef, ownerId: string): void {
    this.projectiles.push({ x: from.x, y: from.y, target: toEnemy, speed: 400, def, ownerId })
  }

  update(dt: number): void {
    this.projectiles = this.projectiles.filter(p => {
      const dx = p.target.x - p.x
      const dy = p.target.y - p.y
      const dist = Math.hypot(dx, dy)
      const step = p.speed * dt
      if (dist <= step) {
        return false
      }
      p.x += (dx / dist) * step
      p.y += (dy / dist) * step
      return true
    })
  }
}
