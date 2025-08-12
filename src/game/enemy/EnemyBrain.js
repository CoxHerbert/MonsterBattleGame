export default class EnemyBrain {
  constructor({ state }){ this.s = state; }

  update(z, dt){
    if (z.cfg.shield){
      z.shieldRegenCd = Math.max(0, z.shieldRegenCd - dt);
      if (z.shieldHp<=0 && z.shieldRegenCd===0){
        z.shieldHp = z.cfg.shield.hp; z.shieldRegenCd = z.cfg.shield.regenCd || 8;
      }
    }

    if (z.ai==='charge' && !z.dashing){
      z.dashCd -= dt;
      if (z.dashCd<=0){ z.dashing=true; z.dashTime = z.cfg.dash.dur; z.dashCd = this._randRange(...z.cfg.dash.cd); }
    }
    if (z.dashing){ z.dashTime -= dt; if (z.dashTime<=0) z.dashing=false; }

    const p = this.s.player;
    let dir = Math.atan2(p.y - z.y, p.x - z.x);
    let speed = z.speed * (z.dashing ? (z.cfg.dash?.mult || 3) : 1);
    z.x += Math.cos(dir) * speed * dt;
    z.y += Math.sin(dir) * speed * dt;
    if (!z.ghost) this.s.resolveCircleObstacles?.(z);

    switch(z.ai){
      case 'spit':
      case 'shoot':
        this._rangedAttack(z, dt); break;
      case 'summon':
        this._summon(z, dt); break;
      case 'suicide':
        this._suicide(z, dt); break;
      case 'boss_tyrant':
        this._rangedCone(z, dt, 0.9, 240, 18); break;
      case 'boss_matriarch':
        this._bossMatriarch(z, dt); break;
      default: break;
    }
  }

  _rangedAttack(z, dt){
    z.shotCd -= dt;
    const p = this.s.player;
    const dist = Math.hypot(p.x - z.x, p.y - z.y);
    if (dist < 680 && z.shotCd<=0){
      const d = Math.atan2(p.y - z.y, p.x - z.x);
      const cfg = z.cfg.shot;
      this.s.bullets.push({
        x:z.x, y:z.y, dir:d, speed:cfg.speed, dmg:z.dmg*0.6, life:2.5,
        from:'enemy', color: cfg.color, effects: cfg.effects || null, fxKey: cfg.fx
      });
      z.shotCd = this._randRange(...cfg.cd);
    }
  }

  _summon(z, dt){
    z.summonCd -= dt; if (z.summonCd>0) return;
    const c = z.cfg.call, n = this._randInt(c.count[0], c.count[1]);
    const base = Math.atan2(this.s.player.y - z.y, this.s.player.x - z.x);
    for (let i=0;i<n;i++){
      const ang = base + (i - (n-1)/2) * (c.arc / Math.max(1,n-1));
      const r = 120 + Math.random()*60;
      const x = z.x + Math.cos(ang)*r, y = z.y + Math.sin(ang)*r;
      this.s.zombies.push(this.s.enemyFactory.create(c.type, x, y, this.s.wave, this.s.enemyPower));
    }
    z.summonCd = this._randRange(...c.cd);
  }

  _suicide(z, dt){
    const p = this.s.player;
    const dist = Math.hypot(p.x - z.x, p.y - z.y);
    if (dist <= z.cfg.boom.radius*0.75){
      this._explode(z);
      z.hp = 0;
    }
  }

  _explode(z){
    const { radius, dmg, falloff } = z.cfg.boom;
    const pd = Math.hypot(this.s.player.x - z.x, this.s.player.y - z.y);
    if (pd <= radius){
      const ratio = 1 - (pd / radius);
      const dealt = dmg * (falloff + (1 - falloff)*ratio);
      this.s.player.hp -= dealt;
    }
    const pal = this.s.skinPalette?.() || {};
    this.s.makeDeathBurst?.(z.x, z.y, pal.explosion || '#ffcf6b'); this.s.sfxHit?.();
  }

  _bossMatriarch(z, dt){
    this._summon(z, dt);
    if (!z._novaCd) z._novaCd = 3.5;
    z._novaCd -= dt;
    if (z._novaCd<=0){
      const N=12;
      for (let i=0;i<N;i++){
        const a = i*(Math.PI*2/N);
        this.s.bullets.push({
          x:z.x, y:z.y, dir:a, speed:320, dmg:z.dmg*0.5, life:3,
          from:'enemy', color:'#d946ef', effects:{ poison:{dps:8,sec:3} }, fxKey:'FX_ACID'
        });
      }
      z._novaCd = 4.5;
    }
  }

  _rangedCone(z, dt, width=1.0, range=260, tickDmg=15){
    if (!z._coneCd) z._coneCd = 2.8; z._coneCd -= dt;
    if (z._coneCd>0) return;
    const p = this.s.player, dir = Math.atan2(p.y - z.y, p.x - z.x);
    const dx = p.x - z.x, dy = p.y - z.y;
    const proj = dx*Math.cos(dir) + dy*Math.sin(dir);
    if (proj>0 && proj<range){
      const perp = Math.abs(-dx*Math.sin(dir) + dy*Math.cos(dir));
      if (perp < proj*Math.tan(width/2)){
        this.s.player.hp -= tickDmg;
      }
    }
    z._coneCd = 2.8;
  }

  _randRange(a,b){ return a + Math.random()*(b-a); }
  _randInt(a,b){ return Math.floor(this._randRange(a, b+1)); }
}
