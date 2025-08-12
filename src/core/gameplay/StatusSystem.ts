import { Enemy } from './Enemy'
import type { StatusEffect } from '../data/types'

interface TrackedEffect {
  target: Enemy
  effect: StatusEffect
}

export class StatusSystem {
  private effects: TrackedEffect[] = []

  add(target: Enemy, effect: StatusEffect): void {
    this.effects.push({ target, effect: { ...effect } })
  }

  tick(dt: number): void {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const te = this.effects[i]
      te.effect.elapsed = (te.effect.elapsed ?? 0) + dt
      if (te.effect.elapsed >= te.effect.duration) {
        this.effects.splice(i, 1)
      }
    }
  }
}
