export default class EnrageSystem {
  constructor({ state }) {
    this.s = state;
    this.globalIntensity = 1;
  }
  update(dt) {
    // TODO: scale difficulty over time
  }
  setGlobalIntensity(x) {
    this.globalIntensity = x;
    for (const z of this.s.zombies) {
      z.hpMax = z.hpMax || z.maxHp || z.hp || 1;
      const baseMax = z.hpMax;
      const wasDead = z.hp <= 0;
      const ratio = (!wasDead && (z.maxHp || baseMax) > 0) ? (z.hp / (z.maxHp || baseMax)) : 0;
      z.maxHp = baseMax * x;
      z.hp = wasDead ? 0 : z.maxHp * ratio;
      if (wasDead) continue;
      z.speedBase = z.speedBase || z.speed || 0;
      z.speed = z.speedBase * (0.95 + 0.05 * x);
      z.dmgBase = z.dmgBase || z.dmg || 0;
      z.dmg = z.dmgBase * x;
    }
  }
}
