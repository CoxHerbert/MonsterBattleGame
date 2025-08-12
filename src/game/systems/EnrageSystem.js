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
      const ratio = z.hpMax > 0 ? (z.hp || z.hpMax) / z.hpMax : 1;
      z.maxHp = z.hpMax * x;
      z.hp = Math.max(1, z.maxHp * ratio);
      z.speedBase = z.speedBase || z.speed || 0;
      z.speed = z.speedBase * (0.95 + 0.05 * x);
      z.dmgBase = z.dmgBase || z.dmg || 0;
      z.dmg = z.dmgBase * x;
    }
  }
}
