import Loop from './core/Loop.js';
import { EventBus } from './core/Events.js';
import InputManager from './input/InputManager.js';
import AudioEngine from './audio/AudioEngine.js';
import { loadSprites } from './assets/Sprites.js';
import ChunkMap from './world/ChunkMap.js';
import { Collision } from './world/Collision.js';
import Spawner from './entities/Spawner.js';
import CombatSystem from './systems/CombatSystem.js';
import DropSystem from './systems/DropSystem.js';
import AugmentSystem from './systems/AugmentSystem.js';
import ScoreSystem from './systems/ScoreSystem.js';
import EnrageSystem from './systems/EnrageSystem.js';
import Renderer2D from './render/Renderer2D.js';
import GameDirector from './director/GameDirector.js';

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
      player: null,
      bullets: [],
      zombies: [],
      drops: [],
      particles: [],
    };

    this.loop = new Loop(this.update.bind(this), this.draw.bind(this));
    this.input = new InputManager({ canvas, bus: this.bus });
    this.audio = new AudioEngine({ store });
    this.world = new ChunkMap({ bus: this.bus });
    this.collision = new Collision();
    this.spawner = new Spawner({ state: this.state, world: this.world });
    this.combat = new CombatSystem({ state: this.state, collision: this.collision, bus: this.bus, audio: this.audio });
    this.drop = new DropSystem({ state: this.state, audio: this.audio });
    this.augment = new AugmentSystem({ state: this.state });
    this.score = new ScoreSystem({ state: this.state });
    this.enrage = new EnrageSystem({ state: this.state });
    this.director = new GameDirector({ state: this.state, spawner: this.spawner, enrage: this.enrage, world: this.world, bus: this.bus, audio: this.audio });
    this.renderer = new Renderer2D({ canvas, ctx: this.ctx, state: this.state, world: this.world, t });
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
    this.director.update(dt);
    this.input.update(this.state, dt);
    this.world.refreshVisibleObstacles(this.state);
    this.combat.update(dt);
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
}
