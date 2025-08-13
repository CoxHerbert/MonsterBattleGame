export default class BulletFactory {
  constructor({ state, sfx }) {
    this.s = state;
    this.sfx = sfx;
  }

  fireMG({ dir }) {
    const p = this.s.player;
    const muzzleX = p.x + Math.cos(dir) * (p.r + 12);
    const muzzleY = p.y + Math.sin(dir) * (p.r + 12);
    const proto = {
      x: muzzleX,
      y: muzzleY,
      dir,
      speed: this.s.weapon.stats.speed,
      dmg: this._calcDamage(this.s.weapon.stats.dmg),
      life: this.s.weapon.stats.life,
      from: 'player',
      spread: this.s.weapon.stats.spread || 0
    };
    this.s.bulletSys.shoot(proto);
  }

  fireRocket({ dir }) {
    const p = this.s.player;
    const muzzleX = p.x + Math.cos(dir) * (p.r + 14);
    const muzzleY = p.y + Math.sin(dir) * (p.r + 14);
    const proto = {
      x: muzzleX,
      y: muzzleY,
      dir,
      speed: this.s.weapon.stats.speed,
      dmg: this._calcDamage(this.s.weapon.stats.dmg),
      life: this.s.weapon.stats.life,
      from: 'player',
      color: '#ffb347',
      explodeOnExpire: true,
      splash: {
        radius: this.s.weapon.stats.splash.radius,
        falloff: this.s.weapon.stats.splash.falloff
      }
    };
    this.s.bulletSys.shoot(proto);
  }

  fireLaser({ dir }) {
    const p = this.s.player;
    const stats = this.s.weapon.stats;
    const tickDmg = this._calcDamage(stats.tickDmg);
    const dps = tickDmg / stats.tick;
    this.s.bulletSys.emitBeam({
      x: p.x,
      y: p.y,
      dir,
      range: stats.range,
      width: stats.width,
      dps,
      life: stats.tick
    });
  }

  _calcDamage(base) {
    const p = this.s.player;
    let dmg = base + (p.damage || 0);
    const crit = Math.random() < (p.critRate || 0);
    if (crit) dmg *= 2.0;
    return dmg;
  }
}
