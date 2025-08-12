export type ProjectileType = 'straight' | 'parabolic' | 'chain' | 'beam'

export interface Projectile {
  x: number
  y: number
  vx: number
  vy: number
  speed: number
  type: ProjectileType
  aoeRadius?: number
  life: number
}
