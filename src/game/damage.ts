export type DamageType = 'physical' | 'magic' | 'elemental'

export interface Resistances {
  physical?: number
  magic?: number
  elemental?: number
}

export interface DamageOptions {
  amount: number
  type: DamageType
  critChance?: number
  armorPen?: number
}

export interface Damageable {
  hp: number
  resistances: Resistances
}

export function applyDamage(target: Damageable, opts: DamageOptions) {
  const res = target.resistances[opts.type] ?? 0
  let dmg = opts.amount * (1 - res)
  if (opts.critChance && Math.random() < opts.critChance) dmg *= 2
  target.hp -= dmg
  return dmg
}
