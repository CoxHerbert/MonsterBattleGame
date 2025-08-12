import level1 from '../data/levels/level01.json'
import enemiesData from '../data/enemies.json'
import towersData from '../data/towers.json'
import type { LevelConfig, EnemyDef, TowerDef, SaveData } from '../data/types'
import { Renderer } from './Renderer'
import { Input } from './Input'
import { EnemyManager } from '../gameplay/EnemyManager'
import { WaveManager } from '../gameplay/WaveManager'
import { Economy } from '../gameplay/Economy'
import { TowerManager } from '../gameplay/TowerManager'
import { bindEnemyManager } from '../gameplay/Targeting'
import { loadGame, saveGame } from '../gameplay/SaveSystem'
import { ProjectileManager } from '../gameplay/ProjectileManager'
import { StatusSystem } from '../gameplay/StatusSystem'

export interface GameCallbacks {
  gold?: (v: number) => void
  life?: (v: number) => void
  wave?: (v: number) => void
  enemies?: (list: any[]) => void
}

class Game {
  level!: LevelConfig
  renderer!: Renderer
  input!: Input
  enemies!: EnemyManager
  waves!: WaveManager
  towers!: TowerManager
  projectiles!: ProjectileManager
  statuses = new StatusSystem()
  economy = new Economy()
  life = 0
  currentWave = 1
  running = false
  paused = false
  speed = 1
  private callbacks: GameCallbacks = {}
  private raf = 0
  private towerDefs: Record<string, TowerDef> = {}
  private buildId: string | null = null
  private buildable: number[][] = []
  private cols = 0
  private rows = 0

  init(canvas: HTMLCanvasElement, level: LevelConfig = level1 as LevelConfig, callbacks: GameCallbacks = {}) {
    this.level = level
    this.callbacks = callbacks
    this.life = level.startLife
    callbacks.life && callbacks.life(this.life)
    this.economy.gold = 0
    this.economy.gain(level.startGold)
    callbacks.gold && callbacks.gold(this.economy.gold)

    const enemyDefs: Record<string, EnemyDef> = {}
    for (const d of enemiesData as EnemyDef[]) enemyDefs[d.id] = d
    this.enemies = new EnemyManager(level, enemyDefs, () => {
      this.life--
      callbacks.life && callbacks.life(this.life)
    }, g => {
      this.economy.gain(g)
      callbacks.gold && callbacks.gold(this.economy.gold)
    })
    bindEnemyManager(this.enemies)
    this.waves = new WaveManager(this.enemies, r => {
      if (r) {
        this.economy.gain(r)
        callbacks.gold && callbacks.gold(this.economy.gold)
      }
    })
    this.waves.init(level)

    for (const t of towersData as TowerDef[]) this.towerDefs[t.id] = t
    this.projectiles = new ProjectileManager(this.statuses, this.enemies)
    this.towers = new TowerManager(this.towerDefs, this.projectiles)

    this.cols = Math.floor(level.width / level.tileSize)
    this.rows = Math.floor(level.height / level.tileSize)
    this.buildable = level.buildable.length ? level.buildable : this.genBuildable(level)

    this.renderer = new Renderer()
    this.renderer.init(canvas, level)

    this.input = new Input(canvas, level.tileSize)
    this.input.onPointer((gx, gy) => {
      const can = !this.buildId || this.canPlace(gx, gy, this.buildId)
      this.renderer.highlightTile(gx, gy, can)
      if (this.buildId) {
        const def = this.towerDefs[this.buildId]
        const cx = gx * level.tileSize + level.tileSize / 2
        const cy = gy * level.tileSize + level.tileSize / 2
        this.renderer.drawRangePreview(cx, cy, def.range)
      }
    })
    this.input.onRightClick(() => {
      this.buildId = null
      this.renderer.hideRangePreview()
    })
    this.input.onClick((gx, gy) => {
      if (!this.buildId) return
      const def = this.towerDefs[this.buildId]
      const cx = gx * level.tileSize + level.tileSize / 2
      const cy = gy * level.tileSize + level.tileSize / 2
      if (this.canPlace(gx, gy, this.buildId) && this.economy.spend(def.cost)) {
        this.towers.placeTower(def.id, cx, cy)
        this.renderer.drawTowers(this.towers.towers)
        callbacks.gold && callbacks.gold(this.economy.gold)
      }
    })
    this.input.onCommand(cmd => {
      switch (cmd) {
        case 'toggle-pause':
          this.togglePause()
          break
        case 'speed1':
          this.setSpeed(1)
          break
        case 'speed2':
          this.setSpeed(2)
          break
        case 'speed3':
          this.setSpeed(3)
          break
        case 'restart':
          location.reload()
          break
      }
    })
    const saved = loadGame()
    if (saved && saved.selectedLevelId === level.id) {
      this.life = saved.progress.life
      callbacks.life && callbacks.life(this.life)
      this.economy.gold = saved.progress.gold
      callbacks.gold && callbacks.gold(this.economy.gold)
      this.waves.setCurrentWave(saved.progress.completedWaves)
      this.speed = saved.settings.speed
      for (const t of saved.progress.towers) {
        const cx = t.gx * level.tileSize + level.tileSize / 2
        const cy = t.gy * level.tileSize + level.tileSize / 2
        const tower = this.towers.placeTower(t.id, cx, cy)
        if (tower) tower.level = t.level
      }
      this.renderer.drawTowers(this.towers.towers)
      this.currentWave = this.waves.currentWave + 1
      callbacks.wave && callbacks.wave(this.currentWave)
    }

    this.loop()
  }

  private loop() {
    let last = performance.now()
    const frame = (now: number) => {
      const dtRaw = (now - last) / 1000
      last = now
      if (!this.paused) {
        const dt = dtRaw * this.speed
        this.waves.update(dt)
        this.enemies.update(dt)
        this.towers.update(dt)
        this.projectiles.update(dt)
        this.statuses.tick(dt)
        this.renderer.drawEnemies(this.enemies.enemies)
        this.renderer.drawTowers(this.towers.towers)
        this.renderer.drawProjectiles(this.projectiles.projectiles)
        if (!this.waves.isWaveRunning()) this.running = false
        this.currentWave = this.waves.currentWave + 1
        this.callbacks.wave && this.callbacks.wave(this.currentWave)
        this.callbacks.enemies && this.callbacks.enemies(this.enemies.enemies)
      }
      this.save()
      this.raf = requestAnimationFrame(frame)
    }
    this.raf = requestAnimationFrame(frame)
  }

  startNextWave() {
    if (!this.waves.isWaveRunning()) {
      this.waves.startNextWave()
      this.running = true
    }
  }

  togglePause() {
    this.paused = !this.paused
  }
  pause() { this.paused = true }
  resume() { this.paused = false }

  setSpeed(s: number) {
    this.speed = s
  }

  setBuildTower(id: string | null) {
    this.buildId = id
    if (!id) this.renderer.hideRangePreview()
  }

  private genBuildable(level: LevelConfig): number[][] {
    const grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(1))
    for (const p of level.paths) {
      const wps = p.waypoints
      for (let i = 0; i < wps.length - 1; i++) {
        const a = wps[i]
        const b = wps[i + 1]
        let gx0 = Math.floor(a.x / level.tileSize)
        let gy0 = Math.floor(a.y / level.tileSize)
        const gx1 = Math.floor(b.x / level.tileSize)
        const gy1 = Math.floor(b.y / level.tileSize)
        if (gx0 === gx1) {
          const [sy, ey] = gy0 < gy1 ? [gy0, gy1] : [gy1, gy0]
          for (let y = sy; y <= ey; y++) grid[y][gx0] = 0
        } else if (gy0 === gy1) {
          const [sx, ex] = gx0 < gx1 ? [gx0, gx1] : [gx1, gx0]
          for (let x = sx; x <= ex; x++) grid[gy0][x] = 0
        }
      }
    }
    return grid
  }

  private canPlace(gx: number, gy: number, towerId: string): boolean {
    if (gx < 0 || gy < 0 || gx >= this.cols || gy >= this.rows) return false
    if (this.buildable[gy][gx] === 0) return false
    const occupied = this.towers.towers.some(t => Math.floor(t.x / this.level.tileSize) === gx && Math.floor(t.y / this.level.tileSize) === gy)
    if (occupied) return false
    const def = this.towerDefs[towerId]
    return this.economy.gold >= def.cost
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.input.dispose()
  }

  private save() {
    const data: SaveData = {
      version: 1,
      selectedLevelId: this.level.id,
      progress: {
        completedWaves: this.waves.currentWave,
        life: this.life,
        gold: this.economy.gold,
        towers: this.towers.towers.map(t => ({
          id: t.id,
          gx: Math.floor(t.x / this.level.tileSize),
          gy: Math.floor(t.y / this.level.tileSize),
          level: t.level
        }))
      },
      settings: { bgm: true, sfx: true, speed: this.speed }
    }
    saveGame(data)
  }
}

export const game = new Game()
