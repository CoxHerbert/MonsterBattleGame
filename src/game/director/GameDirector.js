import cfg from './pacing.config.js';
import { spawnRateAt, spawnCapForChapter, intensityForChapter } from './pacing.curves.js';
import { mulberry32 } from '../core/RNG.js';

export default class GameDirector {
  constructor({ state, spawner, enrage, world, bus, audio }) {
    this.s = state;
    this.spawner = spawner;
    this.enrage = enrage;
    this.world = world;
    this.bus = bus;
    this.audio = audio;

    this.prng = mulberry32(this.s.worldSeed || 1);
    this.s.chapter = this.s.chapter || 1;
    this.resetRunClock();
    this.updateDerived(0);
  }

  resetRunClock() {
    this.s.runTime = 0;
    const [tMin, tMax] = cfg.bossWindowSec;
    const forcedAt = tMin + (tMax - tMin) * this.prng();
    this.s.bossWindow = { tMin, tMax, forcedAt };
    this.s.bossAlive = false;
    this.s.bossStage = 1;
  }

  update(dt) {
    this.s.runTime += dt;
    this.updateDerived(dt);
    this.trySpawnMinions(dt);
    this.tryForceBoss();
  }

  updateDerived(dt) {
    const targetRate = spawnRateAt(this.s.runTime, cfg);
    const a = cfg.spawn.smoothing;
    this.s.spawnRate = (1 - a) * (this.s.spawnRate || targetRate) + a * targetRate;
    this.s.spawnCap = spawnCapForChapter(this.s.chapter, cfg);
    const baseIntensity = intensityForChapter(this.s.chapter, cfg);
    this.s.intensity = baseIntensity;
    this.enrage.setGlobalIntensity?.(this.s.intensity);
  }

  trySpawnMinions(dt) {
    const cap = this.s.spawnCap;
    const alive = this.s.zombies.length;
    if (alive >= cap) return;
    const expected = this.s.spawnRate * dt;
    let accumulator = (this._spawnAcc || 0) + expected;
    let toSpawn = 0;
    while (accumulator >= 1 && (alive + toSpawn) < cap) {
      toSpawn++;
      accumulator -= 1;
    }
    this._spawnAcc = accumulator;
    if (toSpawn > 0) {
      this.spawner.spawnRingN?.(toSpawn);
    }
  }

  tryForceBoss() {
    if (!cfg.boss.ensureUnique) return;
    if (this.s.bossAlive) return;
    const t = this.s.runTime;
    const { forcedAt } = this.s.bossWindow;
    const shouldSoftAdvance = cfg.softBossAdvanceIfLowEnemies && (t > forcedAt * 0.75) && (this.s.zombies.length < Math.max(6, this.s.spawnCap * 0.2));
    if (t >= forcedAt || shouldSoftAdvance) {
      this.spawnBossNow();
    }
  }

  spawnBossNow() {
    if (this.s.bossAlive) return;
    this.spawner.spawnBoss?.({ chapter: this.s.chapter, stage: this.s.bossStage, intensity: this.s.intensity });
    this.s.bossAlive = true;
    if (cfg.boss.announceSfx && this.audio?.sfx) this.audio.sfx('boss_in');
    this.bus.emit?.('director:boss:spawned', { chapter: this.s.chapter, stage: this.s.bossStage });
  }

  onBossDefeated() {
    this.bus.emit?.('director:boss:defeated', { chapter: this.s.chapter, stage: this.s.bossStage });
    this.refreshMap();
    this.s.chapter += 1;
    this.resetRunClock();
    this.updateDerived(0);
  }

  refreshMap() {
    if (cfg.mapRefresh.reseed) {
      this.s.worldSeed = (this.s.worldSeed * 1664525 + 1013904223) >>> 0;
    }
    if (cfg.mapRefresh.clearChunkCache) {
      this.world.clearCache?.();
    }
    this.world.setSafeRadius?.(cfg.mapRefresh.safeRadius);
    this.bus.emit?.('director:map:refreshed', { chapter: this.s.chapter + 1, worldSeed: this.s.worldSeed });
  }
}
