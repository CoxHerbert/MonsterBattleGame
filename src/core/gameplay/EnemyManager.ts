import { Enemy } from './Enemy'
import type { EnemyDef, LevelConfig } from '../data/types'

export class EnemyManager {
  enemies: Enemy[] = []

  constructor(private level: LevelConfig, private defs: Record<string, EnemyDef>, private onEscape?: () => void) {}

  spawn(enemyId: string, lane: number, pos: { x: number; y: number }): Enemy {
    const path = this.level.paths.find(p => p.lane === lane)?.waypoints || []
    const def = this.defs[enemyId]
    const enemy = new Enemy(path, def, this.level.tileSize)
    enemy.x = pos.x
    enemy.y = pos.y
    this.enemies.push(enemy)
    return enemy
  }

  update(dt: number): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]
      e.update(dt)
      if (e.done) {
        this.enemies.splice(i, 1)
        this.onEscape && this.onEscape()
      }
    }
  }

  forEach(fn: (e: Enemy) => void): void {
    this.enemies.forEach(fn)
  }
}
