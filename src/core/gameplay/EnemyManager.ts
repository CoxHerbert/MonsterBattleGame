import { Enemy } from './Enemy'

export class EnemyManager {
  enemies: Enemy[] = []
  update(dt: number) {
    for (const e of this.enemies) e.update(dt)
  }
}
