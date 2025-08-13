export const BUFFS = {
  // Temporary Buffs (drops/skills)
  speed:  { type:'temp',  dur:10,  effects:{ moveMul:1.5 } },
  spread: { type:'temp',  dur:10,  effects:{ shots:+2, dmgMul:0.65, fireIntervalMul:0.83 } },
  burn:   { type:'temp',  dur:10,  effects:{ bullet:{ burn:{ dps:6, time:3 } } } },
  pierce: { type:'temp',  dur:10,  effects:{ bullet:{ pierce:+2 } } },
  bounce: { type:'temp',  dur:10,  effects:{ bullet:{ bounce:+2 } } },
  split:  { type:'temp',  dur:10,  effects:{ bullet:{ split:{ count:2, angle:0.4, dmgMul:0.5 } } } },

  // Permanent Augments
  atk:   { type:'perm',  perLevel:{ dmgMul:1.2 } },
  aspd:  { type:'perm',  perLevel:{ fireIntervalMul:0.9 } },
  speedP:{ type:'perm',  perLevel:{ moveMul:1.1 } },
  hp:    { type:'perm',  perLevel:{ maxHp:+20 } }
};
