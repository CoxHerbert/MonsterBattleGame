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

export const level1: LevelConfig = {
  cols: 10,
  rows: 10,
  tileSize: 64,
  path: [
    { x: 0, y: 4 },
    { x: 4, y: 4 },
    { x: 4, y: 8 },
    { x: 9, y: 8 }
  ],
  spawn: { x: 0, y: 4 },
  end: { x: 9, y: 8 },
  startGold: 20,
  startLives: 20,
  waves: [
    { events: [ { type: 'basic', count: 5, interval: 1 } ] },
    { events: [ { type: 'basic', count: 8, interval: 0.8 }, { type: 'elite', count: 1, interval: 0 } ] }
  ]
}
