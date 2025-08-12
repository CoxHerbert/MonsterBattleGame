import { Enemy } from './Enemy'
import { EnemyManager } from './EnemyManager'

let manager: EnemyManager | null = null
export function bindEnemyManager(mgr: EnemyManager) {
  manager = mgr
}

export function pickTarget(
  origin: { x: number; y: number },
  range: number,
  priority: 'first' | 'last' | 'strong' | 'close'
): Enemy | null {
  if (!manager) return null
  const candidates: Enemy[] = []
  manager.forEach(e => {
    if (Math.hypot(e.x - origin.x, e.y - origin.y) <= range) candidates.push(e)
  })
  if (candidates.length === 0) return null
  switch (priority) {
    case 'strong':
      return candidates.reduce((a, b) => (a.hp > b.hp ? a : b))
    case 'close':
      return candidates.reduce((a, b) =>
        Math.hypot(a.x - origin.x, a.y - origin.y) < Math.hypot(b.x - origin.x, b.y - origin.y) ? a : b
      )
    case 'last':
      return candidates[candidates.length - 1]
    default:
      return candidates[0]
  }
}
