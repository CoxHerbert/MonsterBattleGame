import type { DamageType } from '../data/types'
import { Enemy } from './Enemy'

export function applyDamage(
  target: Enemy,
  payload: { amount: number; type: DamageType; critChance?: number; armorPen?: number; sourceId?: string }
): number {
  const resist = target.resistances?.[payload.type] ?? 0
  let dmg = payload.amount * (1 - resist)
  target.hp -= dmg
  return dmg
}
