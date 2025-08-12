import ecfg from '../config/enemies.config.js';

function pickWeighted(list, weightKey='weight'){
  const sum = list.reduce((a,b)=>a+(b[weightKey]||0),0);
  let r = Math.random()*sum;
  for (const it of list){ r-= (it[weightKey]||0); if (r<=0) return it; }
  return list[list.length-1];
}

export default class EnemyFactory {
  constructor({ state, enrage, spawner }) {
    this.s = state; this.enrage = enrage; this.spawner = spawner;
  }

  createCommon(kind, pos, wave, chapter){
    const tpl = ecfg.common[kind];
    const scale = ecfg.scale;
    const e = {
      x: pos.x, y: pos.y, r: tpl.r,
      maxHp: Math.floor(tpl.base.hp * scale.hp(wave, chapter) * this.enrage.globalIntensity),
      hp: 0, speed: tpl.base.speed * scale.speed(wave, chapter) * this.enrage.globalIntensity,
      dmg: Math.floor(tpl.base.dmg * scale.damage(wave, chapter) * this.enrage.globalIntensity),
      def: tpl.base.def||0, kind, elite:false, boss:false,
      ai: { ...tpl.ai }, shotCd: 0, burnTime:0, burnDps:0
    };
    e.hp = e.maxHp; return e;
  }

  createElite(baseKind, pos, wave, chapter){
    const eliteTpl = pickWeighted(ecfg.elites);
    const base = this.createCommon(baseKind, pos, wave, chapter);
    base.elite = true; base.aura = eliteTpl.aura; base.name = eliteTpl.name;
    const m = eliteTpl.mul;
    base.r *= (m.r||1); base.maxHp = Math.floor(base.maxHp*(m.hp||1));
    base.hp = base.maxHp; base.speed *= (m.speed||1); base.dmg = Math.floor(base.dmg*(m.dmg||1));
    base.ai = { ...base.ai, ...eliteTpl.ai };
    base.dropTier = eliteTpl.dropTier || 'rare';
    return base;
  }

  pickCommonKindByWave(wave){
    const biasRanged = ecfg.spawn.rangedBiasByWave(wave);
    return (Math.random()<biasRanged) ? 'ranged' : 'melee';
  }
}
