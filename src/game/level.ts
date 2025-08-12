export interface PathPoint { x: number; y: number }

export interface LevelConfig {
  cols: number
  rows: number
  tileSize: number
  path: PathPoint[]
  waves: Wave[]
}

export interface Wave {
  count: number
  interval: number
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
  waves: [
    { count: 5, interval: 1 },
    { count: 8, interval: 0.8 }
  ]
}
