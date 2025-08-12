import type { LevelConfig, SpawnEvent } from '../data/types'
import { EnemyManager } from './EnemyManager'

interface SpawnState {
  event: SpawnEvent
  spawned: number
  timer: number
}

export class WaveManager {
  private level!: LevelConfig
  private index = 0
  private running = false
  private time = 0
  private states: SpawnState[] = []

  constructor(private enemies: EnemyManager) {}

  init(level: LevelConfig): void {
    this.level = level
    this.index = 0
    this.running = false
  }

  startNextWave(): void {
    if (this.index >= this.level.waves.length) return
    const wave = this.level.waves[this.index]
    this.states = wave.spawns.map(ev => ({ event: ev, spawned: 0, timer: 0 }))
    this.time = 0
    this.running = true
  }

  isWaveRunning(): boolean {
    return this.running
  }

  update(dt: number): void {
    if (!this.running) return
    this.time += dt
    for (const s of this.states) {
      if (this.time >= s.event.t && s.spawned < s.event.count) {
        s.timer += dt
        if (s.timer >= s.event.interval) {
          const lane = s.event.lane ?? 0
          const start = this.level.paths.find(p => p.lane === lane)?.waypoints[0]
          if (start) this.enemies.spawn(s.event.enemyId, lane, { x: start.x, y: start.y })
          s.spawned++
          s.timer = 0
        }
      }
    }
    const allDone = this.states.every(s => s.spawned >= s.event.count)
    if (allDone && this.enemies.enemies.length === 0) {
      this.running = false
      this.index++
    }
  }

  get currentWave(): number {
    return this.index
  }
}
