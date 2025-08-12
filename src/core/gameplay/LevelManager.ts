import type { LevelConfig } from '../data/types'

export class LevelManager {
  current?: LevelConfig
  load(level: LevelConfig) {
    this.current = level
  }
}
