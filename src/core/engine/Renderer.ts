import { Application, Container, Graphics, Sprite } from 'pixi.js'
import { Assets } from './Assets'
import { attachShadow } from './SpriteUtils'
import type { LevelConfig } from '../data/types'
import type { Enemy } from '../gameplay/Enemy'
import type { Tower } from '../gameplay/Tower'
import type { Projectile } from '../gameplay/Projectile'
import { Pool } from '../utils/Pool'

export class Renderer {
  app!: Application
  private tileSize = 32

  private gridG = new Graphics()
  public laneLayer = new Container()
  private towerLayer = new Container()
  private enemyLayer = new Container()
  private projectileLayer = new Container()
  private overlayLayer = new Container()

  private rangeG = new Graphics()
  private highlightG = new Graphics()

  private enemyPool = new Pool<Sprite>()
  private towerPool = new Pool<Sprite>()
  private projPool = new Pool<Sprite>()
  private enemySprites: Sprite[] = []
  private towerSprites: Sprite[] = []
  private projSprites: Sprite[] = []

  init(canvas: HTMLCanvasElement, level: LevelConfig) {
    this.tileSize = level.tileSize
    this.app = new Application({
      view: canvas,
      width: level.width,
      height: level.height,
      backgroundColor: 0x0e0f12,
      antialias: true,
    })
    this.app.stage.addChild(
      this.gridG,
      this.laneLayer,
      this.towerLayer,
      this.enemyLayer,
      this.projectileLayer,
      this.overlayLayer
    )

    this.rangeG.visible = false
    this.overlayLayer.addChild(this.highlightG)
    this.overlayLayer.addChild(this.rangeG)

    this.drawGrid(level)
  }

  private drawGrid(level: LevelConfig) {
    const { width, height, tileSize } = level
    this.gridG.clear()
    this.gridG.lineStyle(1, 0x333333, 1)
    for (let x = 0; x <= width; x += tileSize) {
      this.gridG.moveTo(x, 0)
      this.gridG.lineTo(x, height)
    }
    for (let y = 0; y <= height; y += tileSize) {
      this.gridG.moveTo(0, y)
      this.gridG.lineTo(width, y)
    }
  }

  toggleLaneLayer() {
    this.laneLayer.visible = !this.laneLayer.visible
  }

  private syncPool<T>(items: T[], sprites: Sprite[], pool: Pool<Sprite>, layer: Container, create: () => Sprite, update: (s: Sprite, item: T) => void) {
    while (sprites.length < items.length) {
      const sp = pool.acquire(create)
      layer.addChild(sp)
      sprites.push(sp)
    }
    for (let i = 0; i < items.length; i++) {
      const sp = sprites[i]
      update(sp, items[i])
      sp.visible = true
    }
    for (let i = items.length; i < sprites.length; i++) {
      const sp = sprites[i]
      sp.visible = false
      pool.release(sp)
    }
    sprites.length = items.length
  }

  drawTowers(towers: Tower[]) {
    this.syncPool(
      towers,
      this.towerSprites,
      this.towerPool,
      this.towerLayer,
      () => {
        const sp = new Sprite()
        sp.anchor.set(0.5)
        attachShadow(sp)
        return sp
      },
      (s, t) => {
        s.texture = Assets.texture(t.id)
        s.position.set(t.x, t.y)
      }
    )
  }

  drawEnemies(enemies: Enemy[]) {
    this.syncPool(
      enemies,
      this.enemySprites,
      this.enemyPool,
      this.enemyLayer,
      () => {
        const sp = new Sprite(Assets.texture('ENEMY'))
        sp.anchor.set(0.5)
        attachShadow(sp)
        return sp
      },
      (s, e) => {
        const slowed = e.statusEffects.some(st => st.kind === 'slow')
        s.tint = slowed ? 0x00ffff : 0xffffff
        s.position.set(e.x, e.y)
        s.width = s.height = e.size * 2
      }
    )
    this.drawHpBars(enemies)
  }

  drawProjectiles(projs: Projectile[]) {
    this.syncPool(
      projs,
      this.projSprites,
      this.projPool,
      this.projectileLayer,
      () => new Graphics(),
      (g, p) => {
        const gg = g as Graphics
        gg.clear()
        gg.beginFill(0xffffff)
        gg.drawCircle(0, 0, 2)
        gg.endFill()
        gg.position.set(p.x, p.y)
      }
    )
  }

  drawRangePreview(x: number, y: number, r: number) {
    this.rangeG.clear()
    this.rangeG.lineStyle(1, 0x00ffff, 0.5)
    this.rangeG.drawCircle(x, y, r)
    this.rangeG.visible = true
  }

  hideRangePreview() {
    this.rangeG.visible = false
  }

  highlightTile(gx: number, gy: number, ok = true) {
    this.highlightG.clear()
    const color = ok ? 0x00ff00 : 0xff0000
    this.highlightG.lineStyle(1, color, 0.8)
    this.highlightG.drawRect(gx * this.tileSize, gy * this.tileSize, this.tileSize, this.tileSize)
  }

  private drawHpBars(enemies: Enemy[]) {
    // remove old hp bars except range and highlight
    for (let i = this.overlayLayer.children.length - 1; i >= 0; i--) {
      const c = this.overlayLayer.children[i]
      if (c !== this.rangeG && c !== this.highlightG) {
        c.destroy()
        this.overlayLayer.removeChild(c)
      }
    }
    for (const e of enemies) {
      const bar = new Graphics()
      const ratio = e.hp / e.maxHp
      bar.beginFill(0x000000)
      bar.drawRect(-e.size, -e.size - 6, e.size * 2, 4)
      bar.endFill()
      bar.beginFill(0xff0000)
      bar.drawRect(-e.size, -e.size - 6, e.size * 2 * ratio, 4)
      bar.endFill()
      bar.position.set(e.x, e.y)
      this.overlayLayer.addChild(bar)
    }
    this.overlayLayer.addChild(this.highlightG)
    this.overlayLayer.addChild(this.rangeG)
  }
}

