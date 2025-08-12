import type { TowerStats } from './Tower'
import { Enemy } from './Enemy'
import { applyDamage } from './DamageSystem'
import { StatusSystem } from './StatusSystem'
import { EnemyManager } from './EnemyManager'
import { Fx } from '../fx/FxSystem'
import { Container } from 'pixi.js'
import { HitSpark } from '../vfx/HitSpark'
import { IceShatter } from '../vfx/IceShatter'
import { HitFlash } from '../vfx/HitFlash'

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

  constructor(
    private statuses: StatusSystem,
    private enemies: EnemyManager,
    private vfxLayer: Container
  ) {}

  fire(from: { x: number; y: number }, toEnemy: Enemy, stats: TowerStats, ownerId: string): void {
    if (stats.projectileType === 'chain') {
      this.chainLightning(from, toEnemy, stats, ownerId)
      return
    }
    this.projectiles.push({ x: from.x, y: from.y, target: toEnemy, speed: 400, stats, ownerId })
  }

  private chainLightning(fromPos: { x: number; y: number }, first: Enemy, stats: TowerStats, ownerId: string) {
    const hit = new Set<Enemy>()
    let current: Enemy | null = first
    let prevPoint = fromPos
    let dmg = stats.damage
    for (let i = 0; i < 3 && current; i++) {
      applyDamage(current, { amount: dmg, type: stats.damageType, sourceId: ownerId })
      if (stats.statusOnHit) this.statuses.add(current, { ...stats.statusOnHit, sourceId: ownerId })
      Fx.chainLightning(prevPoint, { x: current.x, y: current.y })
      if (i === 0) this.vfxLayer.addChild(new HitFlash(current.x, current.y))
      hit.add(current)
      prevPoint = { x: current.x, y: current.y }
      dmg *= 0.7
      current = this.findNext(current, hit, stats.range)
    }
  }

  private findNext(from: Enemy, exclude: Set<Enemy>, range: number): Enemy | null {
    let nearest: Enemy | null = null
    let min = Infinity
    this.enemies.forEach(e => {
      if (exclude.has(e)) return
      const dx = e.x - from.x
      const dy = e.y - from.y
      const dist = Math.hypot(dx, dy)
      if (dist < min && dist <= range) {
        min = dist
        nearest = e
      }
    })
    return nearest
  }

  update(dt: number): void {
    this.projectiles = this.projectiles.filter(p => {
      const dx = p.target.x - p.x
      const dy = p.target.y - p.y
      const dist = Math.hypot(dx, dy)
      const step = p.speed * dt
      if (dist <= step) {
        applyDamage(p.target, {
          amount: p.stats.damage,
          type: p.stats.damageType,
          sourceId: p.ownerId,
        })
        if (p.stats.statusOnHit)
          this.statuses.add(p.target, { ...p.stats.statusOnHit, sourceId: p.ownerId })
        if (p.stats.damageType === 'ice') {
          this.vfxLayer.addChild(new IceShatter(p.target.x, p.target.y))
          this.vfxLayer.addChild(new HitFlash(p.target.x, p.target.y, 10, 0xcffafe))
        } else {
          this.vfxLayer.addChild(new HitSpark(p.target.x, p.target.y))
          this.vfxLayer.addChild(new HitFlash(p.target.x, p.target.y))
        }
        if (p.stats.aoeRadius) Fx.explosion(p.target.x, p.target.y)
        return false
      }
      p.x += (dx / dist) * step
      p.y += (dy / dist) * step
      return true
    })
  }
}
