export function spawnRateAt(tSec, cfg) {
  const { baseRate, maxRate, rampSecTo80 } = cfg.spawn;
  const k = rampSecTo80 / Math.log((maxRate - baseRate) / (maxRate * 0.2));
  const rate = maxRate - (maxRate - baseRate) * Math.exp(-tSec / Math.max(0.001, k));
  return clamp(rate, baseRate, maxRate);
}

export function spawnCapForChapter(chapter, cfg) {
  const { base, perChapter, hardMax } = cfg.spawn.cap;
  return Math.min(hardMax, base + perChapter * (chapter - 1));
}

export function intensityForChapter(chapter, cfg) {
  const mul = Math.pow(cfg.difficulty.chapterMul, Math.max(0, chapter - 1));
  return Math.max(1, mul);
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
