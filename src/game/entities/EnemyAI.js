// 轻量状态机 + 转向/障碍兜避 + 远程射击/冲锋/召唤
export default class EnemyAI {
  constructor({ state, world, collision, spawner }) {
    this.s = state; this.world = world; this.col = collision; this.spawner = spawner;
  }

  step(e, dt){
    if (e.burnTime>0){ e.burnTime -= dt; e.hp -= e.burnDps*dt; }
    if (e.hp <= 0) return;
    if (e.ai.summon) this._trySummon(e, dt);
    if (e.ai.dash)   this._stepDash(e, dt);
    if (!e.dashing) {
      if (e.ai.kind === 'melee') this._seekPlayer(e, dt);
      else if (e.ai.kind === 'ranged') this._kiteAndShoot(e, dt);
    }
  }

  _seekPlayer(e, dt){
    const p = this.s.player;
    const dir = Math.atan2(p.y - e.y, p.x - e.x);
    let step = e.speed * dt;
    let nx = e.x + Math.cos(dir) * step, ny = e.y + Math.sin(dir) * step;
    const fx = nx + Math.cos(dir) * e.r, fy = ny + Math.sin(dir) * e.r;
    if (!e.ghost && this._hitObs(fx, fy)) {
      const sign = Math.random()<0.5?1:-1;
      for (let a=0.3; a<Math.PI; a+=0.3) {
        const nd = dir + sign*a; nx = e.x + Math.cos(nd)*step; ny = e.y + Math.sin(nd)*step;
        const tx = nx + Math.cos(nd)*e.r, ty = ny + Math.sin(nd)*e.r;
        if (!this._hitObs(tx, ty)) break;
      }
    }
    e.x = nx; e.y = ny;
  }

  _kiteAndShoot(e, dt){
    const p = this.s.player;
    const dx = p.x - e.x, dy = p.y - e.y, dist = Math.hypot(dx, dy);
    const prefer = e.ai.range || 520;
    const dir = Math.atan2(dy, dx);
    const towards = (dist > prefer*1.1) ? 1 : (dist < prefer*0.8 ? -1 : 0);
    e.x += Math.cos(dir)*e.speed*dt*towards;
    e.y += Math.sin(dir)*e.speed*dt*towards;
    e.shotCd -= dt;
    if (dist < prefer*1.25 && e.shotCd<=0) {
      const [burstN, burstGap] = e.ai.burst || [1, 0];
      const [cdBase, cdVar]   = e.ai.cd || [1.6, 0.6];
      this._doBurstShoot(e, dir, burstN, burstGap);
      e.shotCd = cdBase + Math.random()*cdVar;
    }
  }

  _doBurstShoot(e, dir, n, gap){
    const make = (ang)=>{
      this.s.bullets.push({ x:e.x, y:e.y, dir:ang, speed:380, dmg:e.dmg*0.6, life:2.3, from:'enemy', color:'#f99' });
    };
    if (n<=1){ make(dir); return; }
    make(dir);
    for (let i=1;i<n;i++){
      const d = i*gap;
      setTimeout(()=> make(dir), d*1000);
    }
  }

  _stepDash(e, dt){
    e.dashCd = (e.dashCd ?? 0) - dt;
    if (!e.dashing && e.dashCd<=0){
      const cfg = e.ai.dash;
      e.dashing = true; e.dashTime = cfg.dur; e.dashCd = (cfg.cd[0] + Math.random()*cfg.cd[1]);
      e.dir = Math.atan2(this.s.player.y - e.y, this.s.player.x - e.x);
      e.wind = cfg.wind;
    }
    if (e.dashing){
      if (e.wind>0){ e.wind -= dt; return; }
      const mult = e.ai.dash.mult;
      const step = e.speed * mult * dt;
      e.x += Math.cos(e.dir)*step; e.y += Math.sin(e.dir)*step;
      e.dashTime -= dt; if (e.dashTime<=0) { e.dashing=false; }
    }
  }

  _trySummon(e, dt){
    e.summonCd = (e.summonCd ?? 0) - dt;
    if (e.summonCd>0) return;
    const cfg = e.ai.summon;
    const count = Math.floor(cfg.count[0] + Math.random()*(cfg.count[1]-cfg.count[0]));
    for (let i=0;i<count;i++){
      const ang = Math.random()*Math.PI*2, r = 180 + Math.random()*140;
      const x = e.x + Math.cos(ang)*r, y = e.y + Math.sin(ang)*r;
      const kind = cfg.kindPool[Math.floor(Math.random()*cfg.kindPool.length)];
      this.spawner.spawnAt({ x, y }, { forceKind:kind });
    }
    e.summonCd = cfg.cd[0] + Math.random()*cfg.cd[1];
  }

  _hitObs(x,y){
    for (const o of this.s.visibleObstacles) if (x>=o.x && x<=o.x+o.w && y>=o.y && y<=o.y+o.h) return true;
    return false;
  }
}
