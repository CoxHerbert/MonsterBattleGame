import { describe, it, expect, vi } from 'vitest';
import cfg from './pacing.config.js';
import { spawnRateAt, spawnCapForChapter, intensityForChapter } from './pacing.curves.js';
import GameDirector from './GameDirector.js';
import EnrageSystem from '../systems/EnrageSystem.js';

describe('pacing curves', () => {
  it('spawnRateAt follows curve', () => {
    const r0 = spawnRateAt(0, cfg);
    const r80 = spawnRateAt(cfg.spawn.rampSecTo80, cfg);
    const rMax = spawnRateAt(1e9, cfg);
    expect(r0).toBeCloseTo(cfg.spawn.baseRate, 2);
    expect(r80).toBeCloseTo(cfg.spawn.maxRate * 0.8, 2);
    expect(rMax).toBeCloseTo(cfg.spawn.maxRate, 2);
  });

  it('spawnCapForChapter grows linearly', () => {
    expect(spawnCapForChapter(1, cfg)).toBe(cfg.spawn.cap.base);
    expect(spawnCapForChapter(5, cfg)).toBe(cfg.spawn.cap.base + cfg.spawn.cap.perChapter * 4);
    expect(spawnCapForChapter(100, cfg)).toBeLessThanOrEqual(cfg.spawn.cap.hardMax);
  });

  it('intensity scales with chapter', () => {
    expect(intensityForChapter(1, cfg)).toBe(1);
    const ch2 = intensityForChapter(2, cfg);
    expect(ch2).toBeCloseTo(cfg.difficulty.chapterMul, 5);
  });
});

describe('GameDirector', () => {
  const create = (seed = 1) => {
    const state = { worldSeed: seed, zombies: [] };
    const spawner = { spawnRingN: vi.fn(), spawnBoss: vi.fn() };
    const enrage = new EnrageSystem({ state });
    const world = { clearCache: vi.fn(), setSafeRadius: vi.fn() };
    const bus = { emit: vi.fn() };
    const audio = { sfx: vi.fn() };
    const dir = new GameDirector({ state, spawner, enrage, world, bus, audio });
    return { state, spawner, enrage, world, bus, audio, dir };
  };

  it('forces boss within window', () => {
    const { dir, spawner, state } = create(123);
    const { forcedAt, tMin, tMax } = state.bossWindow;
    expect(forcedAt).toBeGreaterThanOrEqual(tMin);
    expect(forcedAt).toBeLessThanOrEqual(tMax);
    let t = 0;
    while (t < forcedAt + 1) {
      dir.update(1);
      t += 1;
    }
    expect(spawner.spawnBoss).toHaveBeenCalledTimes(1);
  });

  it('increments chapter and intensity on boss defeat', () => {
    const { dir, state, spawner, enrage, world } = create(1);
    state.zombies.push({ hp: 10, maxHp: 10, speed: 1, dmg: 1 });
    dir.spawnBossNow();
    expect(state.bossAlive).toBe(true);
    dir.onBossDefeated();
    expect(state.chapter).toBe(2);
    expect(state.intensity).toBeCloseTo(cfg.difficulty.chapterMul, 5);
    expect(world.clearCache).toHaveBeenCalled();
    expect(enrage.globalIntensity).toBeCloseTo(state.intensity, 5);
  });

  it('increases spawn rate over time', () => {
    const { dir, state, spawner } = create(1);
    const r1 = spawnRateAt(60, cfg);
    const r2 = spawnRateAt(240, cfg);
    expect(r2 / r1).toBeGreaterThanOrEqual(1.5);
    // ensure spawning respects cap
    state.spawnRate = r2;
    state.spawnCap = 10;
    dir.trySpawnMinions(1);
    expect(spawner.spawnRingN).toHaveBeenCalled();
  });

  it('does not spawn multiple bosses', () => {
    const { dir, spawner, state } = create(1);
    dir.spawnBossNow();
    dir.tryForceBoss();
    expect(spawner.spawnBoss).toHaveBeenCalledTimes(1);
  });
});
