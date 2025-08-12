import { Container, Graphics } from 'pixi.js'

interface Shard {
  g: Graphics
  vx: number
  vy: number
  vr: number
}

export class IceShatter extends Container {
  private life = 0.6
  private shards: Shard[] = []
  constructor(x: number, y: number, count = 8, color = 0x93c5fd) {
    super()
    this.position.set(x, y)
    for (let i = 0; i < count; i++) {
      const g = new Graphics()
      g.beginFill(color)
      g.drawPolygon([0, 0, 2, -4, -2, -4])
      g.endFill()
      const ang = Math.random() * Math.PI * 2
      const spd = 40 + Math.random() * 60
      const vr = (Math.random() - 0.5) * 6
      this.shards.push({ g, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, vr })
      this.addChild(g)
    }
  }
  update(dt: number) {
    this.life -= dt
    this.alpha = this.life / 0.6
    for (const s of this.shards) {
      s.g.x += s.vx * dt
      s.g.y += s.vy * dt
      s.g.rotation += s.vr * dt
    }
    if (this.life <= 0) {
      this.parent?.removeChild(this)
      this.destroy({ children: true })
    }
  }
}
