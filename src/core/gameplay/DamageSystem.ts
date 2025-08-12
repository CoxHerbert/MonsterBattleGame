import type { DamageType } from '../data/types'
import { Enemy } from './Enemy'

export function applyDamage(
  target: Enemy,
  payload: { amount: number; type: DamageType; critChance?: number; armorPen?: number; sourceId?: string }
): number {
  const resist = target.resistances?.[payload.type] ?? 0
  const armor = Math.max(0, target.armor - (payload.armorPen ?? 0))
  let dmg = Math.max(0, payload.amount - armor)
  dmg *= 1 - resist
  target.hp -= dmg
  return dmg
}
