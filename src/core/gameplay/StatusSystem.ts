import { Enemy } from './Enemy'
import type { StatusEffect } from '../data/types'

interface TrackedEffect {
  target: Enemy
  effect: StatusEffect
}

export class StatusSystem {
  private effects: TrackedEffect[] = []

  add(target: Enemy, effect: StatusEffect): void {
    const existing = target.statusEffects.find(e => e.kind === effect.kind && e.sourceId === effect.sourceId)
    if (existing) {
      existing.value = effect.value
      existing.duration = effect.duration
      existing.elapsed = 0
    } else {
      const copy = { ...effect }
      target.statusEffects.push(copy)
      this.effects.push({ target, effect: copy })
    }
  }

  tick(dt: number): void {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const te = this.effects[i]
      if (te.effect.kind === 'poison' && te.effect.dps) {
        te.target.hp -= te.effect.dps * dt
      }
      te.effect.elapsed = (te.effect.elapsed ?? 0) + dt
      if (te.effect.elapsed >= te.effect.duration) {
        const idx = te.target.statusEffects.indexOf(te.effect)
        if (idx !== -1) te.target.statusEffects.splice(idx, 1)
        this.effects.splice(i, 1)
      }
    }
  }
}
