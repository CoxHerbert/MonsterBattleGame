// 难度/模式系数表（可按需继续扩展）
export const DIFFICULTY_PROFILES = {
  // —— 基础档位 —— //
  easy: {
    label: 'easy',
    enemy:   { hpMul: 0.8, dmgMul: 0.8, speedMul: 0.95 },
    spawn:   { rateMul: 0.9 },             // 刷怪频率（<1 更慢）
    boss:    { intervalMul: 1.15, hpMul: 0.9, dmgMul: 0.9 },
    loot:    { dropRateMul: 1.15 },        // 掉落更高
    score:   { scoreMul: 0.9 },            // 得分略低
    player:  { healMul: 1.2, takenMul: 0.9, moveMul: 1.05 },
    weapon:  { bulletDmgMul: 1.05, beamDpsMul: 1.05 }
  },
  normal: {
    label: 'normal',
    enemy:   { hpMul: 1.0, dmgMul: 1.0, speedMul: 1.0 },
    spawn:   { rateMul: 1.0 },
    boss:    { intervalMul: 1.0, hpMul: 1.0, dmgMul: 1.0 },
    loot:    { dropRateMul: 1.0 },
    score:   { scoreMul: 1.0 },
    player:  { healMul: 1.0, takenMul: 1.0, moveMul: 1.0 },
    weapon:  { bulletDmgMul: 1.0, beamDpsMul: 1.0 }
  },
  hard: {
    label: 'hard',
    enemy:   { hpMul: 1.25, dmgMul: 1.25, speedMul: 1.05 },
    spawn:   { rateMul: 1.12 },
    boss:    { intervalMul: 0.92, hpMul: 1.2, dmgMul: 1.2 },
    loot:    { dropRateMul: 0.9 },
    score:   { scoreMul: 1.15 },
    player:  { healMul: 0.9, takenMul: 1.1, moveMul: 0.98 },
    weapon:  { bulletDmgMul: 0.98, beamDpsMul: 0.98 }
  },
  hell: {
    label: 'hell',
    enemy:   { hpMul: 1.6, dmgMul: 1.6, speedMul: 1.1 },
    spawn:   { rateMul: 1.25 },
    boss:    { intervalMul: 0.82, hpMul: 1.4, dmgMul: 1.35 },
    loot:    { dropRateMul: 0.8 },
    score:   { scoreMul: 1.35 },
    player:  { healMul: 0.8, takenMul: 1.2, moveMul: 0.95 },
    weapon:  { bulletDmgMul: 0.95, beamDpsMul: 0.95 }
  }
};

// 模式对全局的附加修正（“无尽/养成”的风格差异）
export const MODE_OVERRIDES = {
  endless: {
    // 无尽：Boss 更频繁，刷怪略快，分更高
    spawn: { rateMul: 1.06 },
    boss:  { intervalMul: 0.95 },
    score: { scoreMul: 1.08 }
  },
  growth: {
    // 养成：掉落更高、治疗更高，Boss 稍晚
    loot:   { dropRateMul: 1.12 },
    player: { healMul: 1.08 },
    boss:   { intervalMul: 1.05 }
  }
};

// 读取并合成：优先难度，再叠模式
export function getDifficultyProfile({ difficulty = 'normal', mode = 'endless' } = {}){
  const base = DIFFICULTY_PROFILES[difficulty] || DIFFICULTY_PROFILES.normal;
  const over = MODE_OVERRIDES[mode] || {};
  // 深合并（只做一层对象 merge）
  const deep = (a,b) => {
    const out = { ...a };
    for (const k in b){
      const v = b[k];
      out[k] = (v && typeof v === 'object' && !Array.isArray(v))
        ? { ...(a[k]||{}), ...v }
        : v;
    }
    return out;
  };
  return deep(base, over);
}
