import { Container, Graphics } from 'pixi.js'

interface Particle {
  g: Graphics
  vx: number
  vy: number
}

export class HitSpark extends Container {
  private life = 0.3
  private parts: Particle[] = []
  constructor(x: number, y: number, count = 5) {
    super()
    this.position.set(x, y)
    for (let i = 0; i < count; i++) {
      const g = new Graphics()
      g.beginFill(0xffd700)
      g.drawRect(-1, -1, 2, 2)
      g.endFill()
      const ang = Math.random() * Math.PI * 2
      const spd = 60 + Math.random() * 80
      this.parts.push({ g, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd })
      this.addChild(g)
    }
  }
  update(dt: number) {
    this.life -= dt
    this.alpha = this.life / 0.3
    for (const p of this.parts) {
      p.g.x += p.vx * dt
      p.g.y += p.vy * dt
    }
    if (this.life <= 0) {
      this.parent?.removeChild(this)
      this.destroy({ children: true })
    }
  }
}
