export default class BulletFactory {
  constructor({ state, sfx }) {
    this.s = state;
    this.sfx = sfx;
  }

  fireMG({ dir }) {
    const p = this.s.player;
    const muzzleX = p.x + Math.cos(dir) * (p.r + 12);
    const muzzleY = p.y + Math.sin(dir) * (p.r + 12);
    this.s.bullets.push({
      x: muzzleX,
      y: muzzleY,
      dir,
      speed: this.s.weapon.stats.speed,
      dmg: this._calcDamage(this.s.weapon.stats.dmg),
      life: this.s.weapon.stats.life,
      from: 'player',
      pierce: this.s.buff?.pierce > 0 ? 2 : (this.s.weapon.stats.pierce || 0),
      bounce: this.s.buff?.bounce > 0 ? 2 : 0,
      burn: this.s.buff?.burn > 0,
      split: this.s.buff?.split > 0
    });
    this.sfx?.shot?.();
  }

  fireRocket({ dir }) {
    const p = this.s.player;
    const muzzleX = p.x + Math.cos(dir) * (p.r + 14);
    const muzzleY = p.y + Math.sin(dir) * (p.r + 14);
    this.s.bullets.push({
      x: muzzleX,
      y: muzzleY,
      dir,
      speed: this.s.weapon.stats.speed,
      dmg: this._calcDamage(this.s.weapon.stats.dmg),
      life: this.s.weapon.stats.life,
      from: 'player',
      color: '#ffb347',
      explodeOnExpire: true,
      explosion: {
        radius: this.s.weapon.stats.splash.radius,
        falloff: this.s.weapon.stats.splash.falloff
      }
    });
    this.sfx?.shot?.();
  }

  fireLaser({ dir }) {
    const p = this.s.player;
    const existing = this.s.bullets.find(b => b.type === 'beam' && b.owner === 'player');
    const range = this.s.weapon.stats.range;
    const width = this.s.weapon.stats.width;
    const tick = this.s.weapon.stats.tick;
    const dmg = this._calcDamage(this.s.weapon.stats.tickDmg);
    if (!existing) {
      this.s.bullets.push({
        type: 'beam',
        owner: 'player',
        x: p.x,
        y: p.y,
        dir,
        range,
        width,
        from: 'player',
        life: 0.08,
        _tick: 0,
        tick,
        tickDmg: dmg
      });
    } else {
      existing.x = p.x;
      existing.y = p.y;
      existing.dir = dir;
      existing.range = range;
      existing.width = width;
      existing.tick = tick;
      existing.tickDmg = dmg;
      existing.life = 0.08;
    }
  }

  _calcDamage(base) {
    const p = this.s.player;
    let dmg = base + (p.damage || 0);
    const crit = Math.random() < (p.critRate || 0);
    if (crit) dmg *= 2.0;
    return dmg;
  }
}
