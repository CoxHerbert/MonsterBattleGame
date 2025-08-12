import Loop from './core/Loop.js';
import { EventBus } from './core/Events.js';
import InputManager from './input/InputManager.js';
import AudioEngine from './audio/AudioEngine.js';
import { loadSprites } from './assets/Sprites.js';
import ChunkMap from './world/ChunkMap.js';
import ItemSpawner from './world/ItemSpawner.js';
import { Collision } from './world/Collision.js';
import Spawner from './entities/Spawner.js';
import CombatSystem from './systems/CombatSystem.js';
import DropSystem from './systems/DropSystem.js';
import AugmentSystem from './systems/AugmentSystem.js';
import ScoreSystem from './systems/ScoreSystem.js';
import EnrageSystem from './systems/EnrageSystem.js';
import Renderer2D from './render/Renderer2D.js';
import GameDirector from './director/GameDirector.js';
import CharacterSystem from './systems/CharacterSystem.js';
import WeaponSystem from './weapons/WeaponSystem.js';
import SkillSystem from './systems/SkillSystem.js';
import ModeManager from './systems/ModeManager.js';
import EconomySystem from './systems/EconomySystem.js';
import MetaSystem from './systems/MetaSystem.js';

export default class Game {
  constructor({ canvas, store, t }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.store = store;
    this.t = t;
    this.bus = new EventBus();

    this.state = {
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      running: false,
      paused: false,
      gameOver: false,
      isNativeFullscreen: false,
      isPseudoFullscreen: false,
      player: {},
      bullets: [],
      zombies: [],
      drops: [],
      particles: [],
      timeNow: 0,
    };

    this.loop = new Loop(this.update.bind(this), this.draw.bind(this));
    this.input = new InputManager({ canvas, bus: this.bus });
    this.audio = new AudioEngine({ store });
    this.world = new ChunkMap({ state: this.state });
    this.itemSpawner = new ItemSpawner({ state: this.state, chunkMap: this.world, bus: this.bus, audio: this.audio });
    this.collision = new Collision();
    this.enrage = new EnrageSystem({ state: this.state });
    this.combat = new CombatSystem({ state: this.state, collision: this.collision, bus: this.bus, audio: this.audio });
    this.spawner = new Spawner({ state: this.state, world: this.world, collision: this.collision, enrage: this.enrage, bus: this.bus, combat: this.combat, audio: this.audio });
    this.drop = new DropSystem({ state: this.state, audio: this.audio });
    this.augment = new AugmentSystem({ state: this.state });
    this.score = new ScoreSystem({ state: this.state });
    this.character = new CharacterSystem({ state: this.state, bus: this.bus });
    this.weapon = new WeaponSystem({ state: this.state, audio: this.audio });
    this.skills = new SkillSystem({ state: this.state, character: this.character, audio: this.audio });
    this.director = new GameDirector({ state: this.state, spawner: this.spawner, enrage: this.enrage, world: this.world, bus: this.bus, audio: this.audio });
    this.meta = new MetaSystem();
    this.economy = new EconomySystem({ meta: this.meta });
    this.modeMgr = new ModeManager({ state: this.state, director: this.director, economy: this.economy, meta: this.meta, bus: this.bus });
    this.renderer = new Renderer2D({ canvas, ctx: this.ctx, state: this.state, world: this.world, t });
    this.character.initPlayer();
    this.modeMgr.startEndless();
  }

  async init() {
    this.resize();
    window.addEventListener('resize', this.resize, { passive: true });
    await loadSprites(this.state);
    this.input.bind(this.state);
    await this.audio.ensure();
    this.reset();
  }

  start() { this.state.running = true; this.loop.start(); }
  stop()  { this.state.running = false; this.loop.stop(); }

  reset() { /* TODO: populate initial state */ }

  update(dt) {
    this.state.timeNow += dt;
    this.director.update(dt);
    this.input.update(this.state, dt);
    this.character.update(dt);
    this.weapon.update(dt, this._fireCtx());
    this.skills.update(dt);
    if (this.input.fireIntent) this.weapon.tryFire(this._fireCtx());
    if (this.input.keyPressed('Shift')) this.skills.cast('dodge', this._skillCtx());
    if (this.input.keyPressed('E'))     this.skills.cast('shield', this._skillCtx());
    if (this.input.keyPressed('Q'))     this.skills.cast('nuke', this._skillCtx());

    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    this.state.screenW = w; this.state.screenH = h;
    const camX = this.state.player.x - w/2, camY = this.state.player.y - h/2;
    this.world.refreshVisibleObstacles(camX, camY, w, h);
    this.itemSpawner.update(dt, this.state.timeNow);
    this.itemSpawner.tryPickupAt(this.state.player.x, this.state.player.y, this.state.player.r);

    this.combat.update(dt);
    this.spawner.update(dt);
    this.combat.stepProjectiles(dt);
    this.combat.stepEnemies(dt);
    this.drop.update(dt);
    this.score.update(dt);

    if (this.state.bossAlive && !this.state.zombies.some(z => z.boss)) {
      this.state.bossAlive = false;
      this.director.onBossDefeated();
    }
  }

  draw() { this.renderer.drawFrame(); }

  resize = () => { /* TODO: handle canvas resizing and minimap */ };

  _fireCtx(){
    const s = this.state;
    return {
      s,
      dir: s.player.dir,
      muzzle:(ox=0,oy=0)=>({
        x: s.player.x + Math.cos(s.player.dir)*(s.player.r+12)+ox,
        y: s.player.y + Math.sin(s.player.dir)*(s.player.r+12)+oy
      }),
      spawnBullet:(b)=> this.combat.spawnBullet?.(b) || this._spawnBulletCompat(b),
      spawnExplosion:(e)=> this.combat.spawnExplosion?.(e),
      queryRay:(dir,range,width)=> this.combat.queryRay?.(dir,range,width) || [],
      sfx:(n)=> this.audio.play?.(n)
    };
  }

  _skillCtx(){
    const s = this.state;
    return {
      s,
      ps: s.player,
      dir: s.player.dir,
      addInvuln:(sec)=> this.character.addInvuln(sec),
      addShield:(v)=> this.character.addShield(v),
      dealGlobalBomb:(dmg,radius)=> this.combat.dealGlobalBomb?.(dmg,radius),
      startCooldown:(id,cd,cdr)=> this.character.startCooldown(id,cd,cdr),
      sfx:(n)=> this.audio.play?.(n),
      cameraShake:(mag,sec)=> this.renderer.shake?.(mag,sec),
      requestDash:(dx,dy,time)=> this.movement?.dash?.(dx,dy,time) || this._dashFallback(dx,dy,time)
    };
  }

  _spawnBulletCompat(b){ this.state.bullets.push(b); }
  _dashFallback(dx,dy,time){
    this.state.player.x += dx;
    this.state.player.y += dy;
  }
}
