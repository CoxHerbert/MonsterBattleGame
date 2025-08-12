import { ENEMY_ARCH } from '../config/enemies.config.js'

export default class EnemyFactory {
  constructor({ state }){ this.s = state; }

  create(type, x, y, wave, powerMul=1){
    const a = ENEMY_ARCH[type]; if (!a) throw new Error('Unknown enemy '+type);
    const baseHp = a.hp * (1 + wave*0.12) * powerMul;
    const hp = baseHp * (0.9 + Math.random()*0.6);
    const z = {
      type, x, y, r: a.r, color:'#fff',
      hp, maxHp: hp, speed: a.spd * (1 + wave*0.02) * powerMul,
      dmg: (a.dmg + wave*0.6) * powerMul,
      elite: !!a.elite, boss: !!a.boss, ghost: !!a.ghost,
      ai: a.ai, burnTime:0, burnDps:0,
      shotCd: 0, dashCd: 1 + Math.random()*1.5, dashing:false, dashTime:0,
      summonCd:0, shieldHp: a.shield?.hp || 0, shieldRegenCd:0,
      ranged: ['spit','shoot','summon'].includes(a.ai),
      cfg: a
    };
    if (a.shot?.cd) z.shotCd  = this._randRange(...a.shot.cd);
    if (a.dash?.cd) z.dashCd  = this._randRange(...a.dash.cd);
    if (a.call?.cd) z.summonCd= this._randRange(...a.call.cd);
    return z;
  }

  _randRange(a,b){ return a + Math.random()*(b-a); }
}
