import wcfg from '../config/weapons.config.js';
import { computeHit } from '../math/formulas.js';

export default class WeaponSystem {
  constructor({ state, audio }) {
    this.s = state;
    this.audio = audio;
    this.cool = 0;
    this.laser = { on:false, warm:0, overheat:0, tick:0 };
  }

  update(dt, ctx){
    const wid = this.s.player.weaponId;
    if (wid === 'laser' && this.laser.on) {
      this.laser.tick -= dt;
      if (this.laser.tick <= 0) { this.laser.tick += wcfg.laser.tick; this._laserDeal(ctx); }
      this.laser.overheat += dt;
      if (this.laser.overheat >= wcfg.laser.overheatSec) this._laserStop();
    } else if (wid === 'laser') {
      this.laser.overheat = Math.max(0, this.laser.overheat - dt / wcfg.laser.cooldownSec * wcfg.laser.overheatSec);
    }
    if (this.cool > 0) this.cool = Math.max(0, this.cool - dt);
  }

  tryFire(ctx){
    const wid = this.s.player.weaponId;
    if (wid === 'mg') return this._fireMg(ctx);
    if (wid === 'rocket') return this._fireRocket(ctx);
    if (wid === 'laser') return this._fireLaser(ctx);
    return false;
  }

  _fireMg(ctx){
    if (this.cool > 0) return false;
    const ps = this.s.player, c = wcfg.mg;
    const dir = ctx.dir + (Math.random()*2-1)*c.spreadRad;
    const m = ctx.muzzle(0,0);
    ctx.spawnBullet({
      x:m.x, y:m.y, dir, speed:c.bulletSpeed, life:c.life, from:'player',
      dmgCalc:(target)=> computeHit(ps.attack, c.baseDamageMul, target.def||0, ps.critRate).damage,
      pierce:c.pierce, bounce:c.bounce, color:'#9cf'
    });
    this.cool = c.fireInterval;
    ctx.sfx?.(c.sfx);
    return true;
  }

  _fireRocket(ctx){
    if (this.cool > 0) return false;
    const ps = this.s.player, c = wcfg.rocket;
    const m = ctx.muzzle(0,0);
    const dmgMul = c.baseDamageMul;
    ctx.spawnBullet({
      x:m.x, y:m.y, dir:ctx.dir, speed:c.rocketSpeed, life:c.life, from:'player', style:'rocket',
      onImpact:(hitX,hitY,hitTarget)=>{
        if (hitTarget) {
          const d = computeHit(ps.attack, dmgMul, hitTarget.def||0, ps.critRate).damage;
          hitTarget.hp -= d;
        }
        ctx.spawnExplosion({
          x:hitX, y:hitY, radius:c.splash.radius, falloff:c.splash.falloff,
          damageFn:(t, distNorm)=> {
            const base = computeHit(ps.attack, dmgMul, t.def||0, ps.critRate).damage;
            return Math.floor(base * (1 - distNorm * c.splash.falloff));
          },
          knockback:c.knockback
        });
        ctx.sfx?.(c.sfxBoom);
      }
    });
    this.cool = c.fireInterval;
    ctx.sfx?.(c.sfx);
    return true;
  }

  _fireLaser(ctx){
    if (this.laser.on) return false;
    this.laser.on = true; this.laser.warm = wcfg.laser.warmup; this.laser.tick = wcfg.laser.tick;
    this.audio?.loop?.(wcfg.laser.sfx);
    return true;
  }
  _laserDeal(ctx){
    const ps = this.s.player, c = wcfg.laser;
    const hits = ctx.queryRay?.(ctx.dir, c.range, c.width) || [];
    const perTick = (ps.attack * c.dpsMul) * (c.tick);
    for (const t of hits) {
      const dmg = Math.max(1, Math.floor(perTick));
      t.hp -= dmg;
    }
  }
  _laserStop(){
    if (!this.laser.on) return;
    this.laser.on = false;
    this.audio?.stopLoop?.(wcfg.laser.sfx);
  }
}
