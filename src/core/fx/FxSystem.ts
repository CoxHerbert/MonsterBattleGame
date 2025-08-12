import { Application, Container, Sprite, Graphics, Text, BLEND_MODES } from 'pixi.js'
import { Pool } from '../utils/Pool'
import { Assets } from '../engine/Assets'

export type Point = { x: number; y: number }

type FxItem = {
  obj: any
  life: number
  start: number
  pool: Pool<any>
  update?: (obj: any, dt: number) => void
}

export class FxSystem {
  private static app: Application
  private static layer: Container
  private static active: FxItem[] = []
  private static intensity: 'low' | 'medium' | 'high' = 'medium'

  private static pools = {
    flash: new Pool<Sprite>(),
    spark: new Pool<Sprite>(),
    ring: new Pool<Sprite>(),
    particle: new Pool<Sprite>(),
    line: new Pool<Graphics>(),
    text: new Pool<Text>(),
  }

  static init(app: Application, root: Container) {
    this.app = app
    this.layer = new Container()
    root.addChild(this.layer)
    this.app.ticker.add(this.update)
  }

  static setIntensity(level: 'low' | 'medium' | 'high') {
    this.intensity = level
  }

  private static add(obj: any, life: number, pool: Pool<any>, update?: (o: any, dt: number) => void) {
    this.layer.addChild(obj)
    this.active.push({ obj, life, start: life, pool, update })
  }

  private static update = (delta: number) => {
    const dt = delta / 60
    for (let i = this.active.length - 1; i >= 0; i--) {
      const fx = this.active[i]
      fx.life -= dt
      if (fx.update) fx.update(fx.obj, dt)
      const ratio = fx.life / fx.start
      if ('alpha' in fx.obj) fx.obj.alpha = ratio
      if (fx.life <= 0) {
        this.layer.removeChild(fx.obj)
        fx.obj.alpha = 1
        fx.pool.release(fx.obj)
        this.active.splice(i, 1)
      }
    }
  }

  static muzzleFlash(x: number, y: number) {
    const sp = this.pools.flash.acquire(() => {
      const s = new Sprite(Assets.texture('fx_muzzle_flash'))
      s.anchor.set(0.5)
      s.blendMode = BLEND_MODES.ADD
      return s
    })
    sp.position.set(x, y)
    sp.rotation = Math.random() * Math.PI * 2
    sp.scale.set(0.5)
    this.add(sp, 0.15, this.pools.flash, s => {
      s.rotation += 10 * 0.015
      s.scale.x += 0.5 * 0.015
      s.scale.y = s.scale.x
    })
  }

  static hit(x: number, y: number) {
    const sp = this.pools.spark.acquire(() => {
      const s = new Sprite(Assets.texture('fx_spark_hex'))
      s.anchor.set(0.5)
      s.blendMode = BLEND_MODES.ADD
      return s
    })
    sp.position.set(x, y)
    sp.rotation = Math.random() * Math.PI * 2
    sp.scale.set(0.3)
    this.add(sp, 0.25, this.pools.spark, s => {
      s.rotation += 15 * 0.015
      s.scale.x += 0.3 * 0.015
      s.scale.y = s.scale.x
    })
  }

  static explosion(x: number, y: number) {
    const ring = this.pools.ring.acquire(() => {
      const s = new Sprite(Assets.texture('fx_ring_soft'))
      s.anchor.set(0.5)
      s.blendMode = BLEND_MODES.ADD
      return s
    })
    ring.position.set(x, y)
    ring.scale.set(0.1)
    this.add(ring, 0.4, this.pools.ring, s => {
      s.scale.x += 2 * 0.015
      s.scale.y = s.scale.x
    })
    if (this.intensity !== 'low') {
      const base = 8
      const count = Math.round(base * (this.intensity === 'high' ? 1.5 : 1))
      for (let i = 0; i < count; i++) {
        const p = this.pools.particle.acquire(() => {
          const s = new Sprite(Assets.texture('fx_particle_dot'))
          s.anchor.set(0.5)
          s.blendMode = BLEND_MODES.ADD
          return s
        })
        p.position.set(x, y)
        p.scale.set(0.2)
        const ang = Math.random() * Math.PI * 2
        const spd = 80 + Math.random() * 60
        this.add(p, 0.5, this.pools.particle, (s, dt) => {
          s.x += Math.cos(ang) * spd * dt
          s.y += Math.sin(ang) * spd * dt
        })
      }
    }
  }

  static shockwave(x: number, y: number) {
    const ring = this.pools.ring.acquire(() => {
      const s = new Sprite(Assets.texture('fx_ring_soft'))
      s.anchor.set(0.5)
      s.blendMode = BLEND_MODES.ADD
      return s
    })
    ring.position.set(x, y)
    ring.scale.set(0.1)
    this.add(ring, 0.3, this.pools.ring, s => {
      s.scale.x += 3 * 0.015
      s.scale.y = s.scale.x
    })
  }

  static chainLightning(a: Point, b: Point) {
    const g = this.pools.line.acquire(() => new Graphics())
    g.clear()
    g.lineStyle(2, 0x00ffff)
    g.moveTo(a.x, a.y)
    g.lineTo(b.x, b.y)
    g.blendMode = BLEND_MODES.ADD
    this.add(g, 0.1, this.pools.line)
  }

  static laser(a: Point, b: Point) {
    const g = this.pools.line.acquire(() => new Graphics())
    g.clear()
    g.lineStyle(4, 0xff0000)
    g.moveTo(a.x, a.y)
    g.lineTo(b.x, b.y)
    g.blendMode = BLEND_MODES.ADD
    this.add(g, 0.15, this.pools.line)
  }

  static floatingText(x: number, y: number, text: string) {
    if (this.intensity === 'low') return
    const t = this.pools.text.acquire(
      () => new Text(text, { fontFamily: 'Arial', fontSize: 14, fill: 0xffffff })
    )
    t.text = text
    t.anchor.set(0.5)
    t.position.set(x, y)
    this.add(t, 0.6, this.pools.text, (s, dt) => {
      s.y -= 30 * dt
    })
  }
}

export const Fx = FxSystem

