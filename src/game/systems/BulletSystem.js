export default class BulletSystem {
  constructor({ state, buffSys, sfx }){
    this.s = state;
    this.buff = buffSys;
    this.sfx = sfx;
    this.bullets = [];
  }

  shoot(proto){
    let p = this.buff.applyToBullet(proto);
    if (p.type === 'beam'){
      // beams: check existing and update
      const existing = this.bullets.find(b=>b.type==='beam' && b.from===p.from);
      if (!existing){
        this.bullets.push({ ...p, life:p.life ?? 0.08, _tick:0, tick:p.tick, tickDmg:p.tickDmg });
      } else {
        Object.assign(existing, p);
        existing.life = p.life ?? existing.life;
      }
      return 1;
    }
    const shots = 1 + (p._shotsAdd || 0);
    const spread = p.spread || 0;
    for (let i=0;i<shots;i++){
      const t = (shots===1)?0:(i-(shots-1)/2)/((shots-1)/2);
      const dir = p.dir + t*spread;
      this.bullets.push({ ...p, dir, life:p.life ?? 0.9, r:p.r || 3 });
    }
    this.sfx?.shot?.();
    return shots;
  }

  update(dt){
    const list=this.bullets;
    const S=this.s;
    for (let i=list.length-1;i>=0;i--){
      const b=list[i];

      if (b.type==='beam'){
        b.life -= dt; if (b.life<=0){ list.splice(i,1); continue; }
        b._tick = (b._tick||0) - dt;
        if (b._tick<=0){
          b._tick = b.tick;
          const cos=Math.cos(b.dir), sin=Math.sin(b.dir);
          for (const z of S.zombies){
            const dx=z.x-b.x, dy=z.y-b.y;
            const proj=dx*cos+dy*sin;
            if (proj < -z.r || proj > b.range + z.r) continue;
            const px=b.x + cos * Math.max(0, Math.min(b.range, proj));
            const py=b.y + sin * Math.max(0, Math.min(b.range, proj));
            const dist=Math.hypot(z.x-px, z.y-py);
            if (dist <= z.r + b.width){ z.hp -= b.tickDmg; if (z.hp<=0) this.onKill(z, S.zombies.indexOf(z)); }
          }
        }
        continue;
      }

      if (b.homing){
        const tx = S.player.x, ty = S.player.y;
        const tDir = Math.atan2(ty - b.y, tx - b.x);
        const diff = ((tDir - b.dir + Math.PI)%(Math.PI*2)) - Math.PI;
        const maxTurn = (b.homingTurn||2.5)*dt;
        b.dir += Math.max(-maxTurn, Math.min(maxTurn, diff));
      }

      b.x += Math.cos(b.dir)*(b.speed||640)*dt;
      b.y += Math.sin(b.dir)*(b.speed||640)*dt;

      if (S.pointHitObstacle(b.x, b.y)){
        if (b.bounce && b.bounce>0){
          b.dir += Math.PI;
          b.bounce--;
          b.x += Math.cos(b.dir)*4; b.y += Math.sin(b.dir)*4;
        } else {
          b.life = 0;
        }
      }

      b.life -= dt;
      if (b.life <= 0){
        if (b.explodeOnExpire && b.from==='player') this.onExplosion(b);
        list.splice(i,1); continue;
      }

      if (b.from==='enemy'){
        if (S.circleHit(b.x,b.y,b.r||3,S.player.x,S.player.y,S.player.r)){
          S.player.hp -= b.dmg||1;
          list.splice(i,1);
        }
        continue;
      }

      for (let j=S.zombies.length-1;j>=0;j--){
        const z=S.zombies[j];
        if (S.circleHit(b.x,b.y,b.r||3,z.x,z.y,z.r)){
          z.hp -= b.dmg||1;
          if (b.burn){ z.burnTime = Math.max(z.burnTime||0, b.burn.time||0); z.burnDps = b.burn.dps || z.burnDps || 0; }
          this.sfx?.hit?.();
          if (b.split && !b._fromSplit){
            const c=b.split.count||2, ang=b.split.angle||0.4, dm=b.split.dmgMul||0.5;
            for (let k=0;k<c;k++){
              const offset=(k-(c-1)/2)*ang;
              this.bullets.push({ x:z.x,y:z.y,dir:b.dir+offset,speed:(b.speed||640)*0.9,dmg:Math.max(1,Math.floor((b.dmg||1)*dm)),life:0.6,from:'player',pierce:0,bounce:0,burn:b.burn,_fromSplit:true,r:3 });
            }
          }
          if (b.pierce && b.pierce>0){ b.pierce--; }
          else { list.splice(i,1); }
          if (z.hp<=0) this.onKill(z, j);
          break;
        }
      }
    }
  }

  onExplosion(b){
    const S=this.s;
    const radius=(b.splash && b.splash.radius)||96;
    for (let j=S.zombies.length-1;j>=0;j--){
      const z=S.zombies[j];
      const d=Math.hypot(z.x-b.x,z.y-b.y);
      if (d<=radius){
        const fall=(b.splash && b.splash.falloff)??0.5;
        const mul=1-(d/radius)*fall;
        z.hp -= Math.max(1, Math.floor((b.dmg||1)*Math.max(0.25,mul)));
        if (b.burn){ z.burnTime = Math.max(z.burnTime||0, b.burn.time||0); z.burnDps = b.burn.dps || z.burnDps || 0; }
        if (z.hp<=0) this.onKill(z, j);
      }
    }
    S.makeDeathBurst(b.x,b.y,'#ffcf6b'); this.sfx?.hit?.();
  }

  onKill(z, idx){
    const S=this.s;
    S.zombies.splice(idx,1);
    if (typeof S.onKill === 'function') S.onKill(z);
  }
}
