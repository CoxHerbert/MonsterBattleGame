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
    const stunned = this.statusEffects.some(e => e.kind === 'stun')
    const slowFactor = this.statusEffects.reduce((f, e) =>
      e.kind === 'slow' ? f * (1 - (e.value ?? 0)) : f,
    1)
    const speed = this.moveSpeed * slowFactor
    const next = this.path[this.seg + 1]
    if (!next) {
      this.done = true
      return
    }
    const dx = next.x - this.x
    const dy = next.y - this.y
    const dist = Math.hypot(dx, dy)
    const step = speed * dt
    if (!stunned) {
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
}
