import { Tower, TowerStats } from './Tower'
import type { TowerDef } from '../data/types'
import { pickTarget } from './Targeting'
import { ProjectileManager } from './ProjectileManager'
import { Fx } from '../fx/FxSystem'

export class TowerManager {
  towers: Tower[] = []

  constructor(private defs: Record<string, TowerDef>, private projectiles: ProjectileManager) {}

  placeTower(towerId: string, x: number, y: number): Tower | null {
    const def = this.defs[towerId]
    if (!def) return null
    const tower = new Tower(towerId, x, y, {
      range: def.range,
      fireRate: def.fireRate,
      damage: def.damage,
      damageType: def.damageType,
      cost: def.cost,
      projectileType: def.projectile,
      aoeRadius: def.aoeRadius,
      statusOnHit: def.statusOnHit,
      targetPriority: def.targetPriority
    })
    this.towers.push(tower)
    return tower
  }

  upgradeTower(towerUid: string): boolean {
    const t = this.towers.find(t => t.uid === towerUid)
    if (!t) return false
    t.level++
    return true
  }

  sellTower(towerUid: string): number {
    const idx = this.towers.findIndex(t => t.uid === towerUid)
    if (idx === -1) return 0
    const [t] = this.towers.splice(idx, 1)
    return Math.floor(t.stats.cost * 0.6)
  }

  update(dt: number): void {
    for (const t of this.towers) {
      t.cooldown = Math.max(0, t.cooldown - dt)
      if (t.cooldown <= 0) {
        const target = pickTarget({ x: t.x, y: t.y }, t.stats.range, t.stats.targetPriority!)
        if (target) {
          Fx.muzzleFlash(t.x, t.y)
          this.projectiles.fire({ x: t.x, y: t.y }, target, t.stats as TowerStats, t.uid)
          t.cooldown = 1 / t.stats.fireRate
        }
      }
    }
  }
}
