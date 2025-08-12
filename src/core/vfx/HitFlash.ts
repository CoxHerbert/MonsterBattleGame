import { Graphics } from 'pixi.js'

export class HitFlash extends Graphics {
  private life = 0.15
  constructor(x: number, y: number, size = 6, color = 0xffffff) {
    super()
    this.position.set(x, y)
    this.lineStyle(2, color)
    this.moveTo(-size, 0)
    this.lineTo(size, 0)
    this.moveTo(0, -size)
    this.lineTo(0, size)
  }
  update(dt: number) {
    this.life -= dt
    this.alpha = this.life / 0.15
    if (this.life <= 0) {
      this.parent?.removeChild(this)
      this.destroy()
    }
  }
}
