export interface PathPoint { x: number; y: number }

export interface LevelConfig {
  cols: number
  rows: number
  tileSize: number
  path: PathPoint[]
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
  ]
}
