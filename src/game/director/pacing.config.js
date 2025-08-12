export default {
  bossWindowSec: [90, 120],
  softBossAdvanceIfLowEnemies: true,
  spawn: {
    baseRate: 0.6,
    maxRate: 2.2,
    rampSecTo80: 180,
    cap: { base: 30, perChapter: 8, hardMax: 120 },
    smoothing: 0.15,
  },
  difficulty: {
    chapterMul: 1.18,
    eliteBonus: 1.10,
    bossBonusPerStage: 1.25,
  },
  boss: {
    ensureUnique: true,
    despawnOthersOnSpawn: false,
    announceSfx: true,
  },
  mapRefresh: {
    reseed: true,
    clearChunkCache: true,
    safeRadius: 380,
  },
};
