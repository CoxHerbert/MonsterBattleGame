export interface PathPoint { x: number; y: number }

export interface SpawnEvent {
  type: string
  count: number
  interval: number
}

export interface Wave {
  events: SpawnEvent[]
}

export interface LevelConfig {
  cols: number
  rows: number
  tileSize: number
  path: PathPoint[]
  spawn: PathPoint
  end: PathPoint
  startGold: number
  startLives: number
  waves: Wave[]
}
