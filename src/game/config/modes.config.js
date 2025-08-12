export default {
  ENDLESS: {
    id: 'ENDLESS',
    name: '无尽模式',
    director: {
      bossWindowSec: [90, 120],
      spawnCurve: { baseRate: 0.6, maxRate: 2.4, rampSecTo80: 180 },
      cap: { base: 28, perChapter: 10, hardMax: 160 },
      chapterMul: 1.18
    },
    objectives: [{ type: 'survive', seconds: Infinity }],
    failOn: 'player_dead',
    scoring: { perKill: 10, comboMul: true, surviveBonusPerMin: 60 },
    rewards: {
      expPerScore: 0.05,
      softCurrencyPerScore: 0.02,
      rareDropChancePerBoss: 0.20
    },
    metaAllowed: true,
    loadout: { allowCarryoverWeapon: true }
  },
  PROGRESSION: {
    id: 'PROGRESSION',
    name: '养成模式',
    chapters: [
      { id: '1-1', name: '第一章 · 绿地外围', seed: 12345, minutes: 8, bossAtSec: [120, 150], goal: { type: 'defeat_boss' } },
      { id: '1-2', name: '第一章 · 工业走廊', seed: 22345, minutes: 10, bossAtSec: [180, 210], goal: { type: 'defeat_boss' } }
    ],
    director: {
      spawnCurve: { baseRate: 0.5, maxRate: 2.0, rampSecTo80: 210 },
      cap: { base: 24, perChapter: 6, hardMax: 120 },
      chapterMul: 1.12
    },
    scoring: { perKill: 8, comboMul: true, surviveBonusPerMin: 40 },
    rewards: {
      expBasePerChapter: 120,
      softCurrencyPerChapter: 100,
      clearBonus: 200,
      rareDropOnFirstClear: true
    },
    metaAllowed: true,
    loadout: { allowCarryoverWeapon: true, allowPreMissionPerks: true }
  }
};
