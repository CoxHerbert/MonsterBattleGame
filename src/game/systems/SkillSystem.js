import scfg from '../config/skills.config.js';
import { applyCdr } from '../math/formulas.js';
import charCfg from '../config/character.config.js';

export default class SkillSystem {
  constructor({ state, character, audio }) {
    this.s = state;
    this.char = character;
    this.audio = audio;
  }

  canCast(id){
    const ps = this.s.player; const cd = ps.skillCooldowns[id] || 0;
    if (cd > 0) return false;
    if (id === 'nuke') {
      const need = scfg.nuke.energyCost ?? charCfg.energy.nukeCost;
      return ps.energy >= need;
    }
    return true;
  }

  cast(id, ctx){
    const ps = this.s.player;
    if (!this.canCast(id)) return false;

    if (id === 'dodge') {
      const c = scfg.dodge;
      this.char.addInvuln(c.invulnSec);
      const dx = Math.cos(ctx.dir) * (c.dashDist);
      const dy = Math.sin(ctx.dir) * (c.dashDist);
      ctx.requestDash?.(dx, dy, c.dashTime);
      this.char.startCooldown('dodge', c.cd);
      ctx.sfx?.(c.sfx);
      return true;
    }

    if (id === 'shield') {
      const c = scfg.shield;
      this.char.addShield(c.shieldValue);
      const until = (this._shieldUntil = (this.s.timeNow + c.duration));
      this._shieldDecay = c.decayPerSec;
      this.char.startCooldown('shield', c.cd);
      ctx.sfx?.(c.sfx);
      return true;
    }

    if (id === 'nuke') {
      const c = scfg.nuke;
      const need = c.energyCost ?? charCfg.energy.nukeCost;
      ps.energy -= need;
      ctx.dealGlobalBomb(ps.attack * (c.baseDamageMul), c.radius);
      this.char.startCooldown('nuke', c.cd);
      ctx.cameraShake?.(10, 0.3);
      ctx.sfx?.(c.sfx);
      return true;
    }
    return false;
  }

  update(dt){
    const ps = this.s.player;
    if (ps.shieldHp > 0 && this._shieldUntil){
      if (this.s.timeNow >= this._shieldUntil) {
        ps.shieldHp = 0; this._shieldUntil = 0;
      } else {
        ps.shieldHp = Math.max(0, ps.shieldHp - this._shieldDecay * dt);
      }
    }
  }
}
