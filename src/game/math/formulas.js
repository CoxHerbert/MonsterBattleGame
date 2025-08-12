import charCfg from '../config/character.config.js';

// 有效伤害（含防御减伤、暴击）
// raw = attack * mul
// final = Crit( raw ) * ( 1 - DEF / (DEF + K) )
export function computeHit(rawAttack, damageMul, targetDef, critRate, critMul = charCfg.damage.critMul) {
  const base = Math.max(1, rawAttack * damageMul);
  const reduced = base * (1 - targetDef / (targetDef + charCfg.damage.defenseK));
  const isCrit = Math.random() < Math.max(0, Math.min(1, critRate));
  return { damage: Math.floor(reduced * (isCrit ? critMul : 1)), isCrit };
}

export function tickDot(dps, tickSec = charCfg.damage.dotTick) {
  return Math.max(1, Math.floor(dps * tickSec));
}

export function clamp01(x){ return Math.max(0, Math.min(1, x)); }
export function applyCdr(baseCd, cdr){ // cdr: 0~0.45
  const c = Math.max(charCfg.cdrClamp.min, Math.min(charCfg.cdrClamp.max, cdr || 0));
  return baseCd * (1 - c);
}
