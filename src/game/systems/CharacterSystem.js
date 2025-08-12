import charCfg from '../config/character.config.js';
import { applyCdr, clamp01 } from '../math/formulas.js';

export default class CharacterSystem {
  constructor({ state, bus }) {
    this.s = state;
    this.bus = bus;
  }
  initPlayer() {
    const b = charCfg.base;
    const ps = this.s.player;
    ps.level = ps.level || 1;
    ps.maxHp = (ps.maxHp ?? (b.hp + charCfg.growthPerLevel.hp * (ps.level-1)));
    ps.hp = ps.maxHp;
    ps.attack = (ps.attack ?? (b.attack + charCfg.growthPerLevel.attack * (ps.level-1)));
    ps.defense = (ps.defense ?? (b.defense + charCfg.growthPerLevel.defense * (ps.level-1)));
    ps.moveSpeed = ps.moveSpeed ?? b.moveSpeed;
    ps.critRate = clamp01((ps.critRate ?? b.critRate) + charCfg.growthPerLevel.critRate * (ps.level-1));
    ps.cdr = clamp01(ps.cdr ?? b.cdr);
    ps.invulnTime = 0;
    ps.shieldHp = 0;
    ps.energy = 0;
    ps.maxEnergy = charCfg.energy.max;
    ps.skillCooldowns = { dodge:0, shield:0, nuke:0 };
    ps.weaponId = ps.weaponId || 'mg';
  }
  update(dt){
    const ps = this.s.player;
    // 无敌/护盾时间推进
    if (ps.invulnTime > 0) ps.invulnTime = Math.max(0, ps.invulnTime - dt);
    // 技能冷却推进（含 CDR）
    for (const k of Object.keys(ps.skillCooldowns)) {
      const v = ps.skillCooldowns[k];
      if (v > 0) ps.skillCooldowns[k] = Math.max(0, v - dt);
    }
    // 能量自然回复
    ps.energy = Math.min(ps.maxEnergy, ps.energy + charCfg.energy.regenPerSec * dt);
  }
  startCooldown(id, baseCd){
    const ps = this.s.player;
    ps.skillCooldowns[id] = applyCdr(baseCd, ps.cdr);
  }
  addInvuln(sec){ this.s.player.invulnTime = Math.max(this.s.player.invulnTime, sec); }
  addShield(v){ this.s.player.shieldHp = Math.max(this.s.player.shieldHp, v); }
  takeDamage(amount){
    const ps = this.s.player;
    if (ps.invulnTime > 0) return 0;
    let remain = amount;
    if (ps.shieldHp > 0) {
      const use = Math.min(ps.shieldHp, remain);
      ps.shieldHp -= use; remain -= use;
    }
    if (remain > 0) ps.hp = Math.max(0, ps.hp - remain);
    if (ps.hp <= 0) this.bus.emit?.('player:dead');
    return amount - remain;
  }
}
