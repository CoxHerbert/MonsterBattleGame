import type { DamageType } from './DamageSystem'
import type { StatusEffect } from './Enemy'

export interface TowerStats {
  range: number
  fireRate: number
  damage: number
  damageType: DamageType
  cost: number
  projectileType?: string
  aoeRadius?: number
  statusOnHit?: StatusEffect
  targetPriority?: 'first' | 'last' | 'strong' | 'weak'
}

export class Tower {
  cooldown = 0
  level = 1
  constructor(public x: number, public y: number, public stats: TowerStats) {}
}
