export type StatusEffectType = 'slow' | 'poison' | 'stun'

export interface StatusEffect {
  type: StatusEffectType
  value: number
  duration: number
}

import type { Resistances } from './damage'
import type { PathPoint } from './level'

export class Enemy {
  x: number
  y: number
  hp: number
  maxHp: number
  armor: number
  moveSpeed: number
  bounty: number
  element: string
  size: number
  resistances: Resistances
  statusEffects: StatusEffect[] = []
  seg = 0

  constructor(
    private path: PathPoint[],
    private tileSize: number,
    opts: {
      hp: number
      armor: number
      moveSpeed: number
      bounty: number
      element?: string
      size?: number
      resistances?: Resistances
    }
  ) {
    this.x = path[0].x * tileSize + tileSize / 2
    this.y = path[0].y * tileSize + tileSize / 2
    this.hp = this.maxHp = opts.hp
    this.armor = opts.armor
    this.moveSpeed = opts.moveSpeed
    this.bounty = opts.bounty
    this.element = opts.element ?? 'physical'
    this.size = opts.size ?? 1
    this.resistances = opts.resistances ?? {}
  }

  update(dt: number) {
    const next = this.path[this.seg + 1]
    if (!next) return
    const tx = next.x * this.tileSize + this.tileSize / 2
    const ty = next.y * this.tileSize + this.tileSize / 2
    const dx = tx - this.x
    const dy = ty - this.y
    const dist = Math.hypot(dx, dy)
    const step = this.moveSpeed * dt
    if (dist <= step) {
      this.x = tx
      this.y = ty
      this.seg++
    } else {
      this.x += (dx / dist) * step
      this.y += (dy / dist) * step
    }
  }
}
