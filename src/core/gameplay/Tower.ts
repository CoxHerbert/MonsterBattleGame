import type { DamageType } from './DamageSystem'
import type { StatusEffect } from '../data/types'

export interface TowerStats {
  range: number
  fireRate: number
  damage: number
  damageType: DamageType
  cost: number
  projectileType?: string
  aoeRadius?: number
  statusOnHit?: StatusEffect
  targetPriority?: 'first' | 'last' | 'strong' | 'close'
}

export class Tower {
  uid: string
  cooldown = 0
  level = 1
  constructor(
    public id: string,
    public x: number,
    public y: number,
    public stats: TowerStats
  ) {
    this.uid = Math.random().toString(36).slice(2)
    if (!this.stats.targetPriority) this.stats.targetPriority = 'first'
  }
}
