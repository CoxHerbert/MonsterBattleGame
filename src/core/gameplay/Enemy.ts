import type { EnemyDef, StatusEffect } from '../data/types'

export class Enemy {
  x: number
  y: number
  hp: number
  maxHp: number
  armor: number
  moveSpeed: number // pixels per second
  bounty: number
  size: number
  resistances?: Partial<Record<string, number>>
  statusEffects: StatusEffect[] = []
  private path: { x: number; y: number }[]
  private seg = 0
  done = false

  constructor(path: { x: number; y: number }[], def: EnemyDef, tileSize: number) {
    this.path = path
    this.x = path[0].x
    this.y = path[0].y
    this.hp = this.maxHp = def.hp
    this.armor = def.armor
    this.moveSpeed = def.moveSpeed * tileSize
    this.bounty = def.bounty
    this.size = def.size
    this.resistances = def.resist
  }

  update(dt: number) {
    const next = this.path[this.seg + 1]
    if (!next) {
      this.done = true
      return
    }
    const dx = next.x - this.x
    const dy = next.y - this.y
    const dist = Math.hypot(dx, dy)
    const step = this.moveSpeed * dt
    if (dist <= step) {
      this.x = next.x
      this.y = next.y
      this.seg++
    } else {
      this.x += (dx / dist) * step
      this.y += (dy / dist) * step
    }
  }
}
