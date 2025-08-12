import type { TowerStats } from './Tower'
import { Enemy } from './Enemy'
import { applyDamage } from './DamageSystem'
import { StatusSystem } from './StatusSystem'

interface Projectile {
  x: number
  y: number
  target: Enemy
  speed: number
  stats: TowerStats
  ownerId: string
}

export class ProjectileManager {
  projectiles: Projectile[] = []

  constructor(private statuses: StatusSystem) {}

  fire(from: { x: number; y: number }, toEnemy: Enemy, stats: TowerStats, ownerId: string): void {
    this.projectiles.push({ x: from.x, y: from.y, target: toEnemy, speed: 400, stats, ownerId })
  }

  update(dt: number): void {
    this.projectiles = this.projectiles.filter(p => {
      const dx = p.target.x - p.x
      const dy = p.target.y - p.y
      const dist = Math.hypot(dx, dy)
      const step = p.speed * dt
      if (dist <= step) {
        applyDamage(p.target, { amount: p.stats.damage, type: p.stats.damageType, sourceId: p.ownerId })
        if (p.stats.statusOnHit) this.statuses.add(p.target, { ...p.stats.statusOnHit, sourceId: p.ownerId })
        return false
      }
      p.x += (dx / dist) * step
      p.y += (dy / dist) * step
      return true
    })
  }
}
