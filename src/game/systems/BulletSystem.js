export default class BulletSystem {
  constructor({ state, buffSys, sfx }){
    this.s = state;
    this.buff = buffSys;
    this.sfx = sfx;
    this.bullets = [];
  }

  shoot(proto){
    let p = this.buff.applyToBullet(proto);
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

  /* ===== 激光：持续型伤害（穿透障碍） =====
     proto 字段：
       - x,y, dir：起点与方向
       - range：长度（像素）
       - width：宽度（像素）
       - dps：每秒伤害（会被 Buff 乘区修正）
       - life：持续时间（秒）
       - from：'player'（默认）
  */
  emitBeam(proto){
    const snap = this.buff.getSnapshot();
    const dps = Math.max(1, Math.floor((proto.dps||30) * (snap.dmgMul||1) * (snap.bullet.shotDmgMul||1)));

    const beam = {
      type:'beam',
      from: proto.from || 'player',
      x: proto.x, y: proto.y, dir: proto.dir,
      range: proto.range || 520,
      width: Math.max(2, proto.width || 6),
      dps,
      life: proto.life ?? 0.6,
      burn: snap.bullet.burn ? { ...snap.bullet.burn } : null
    };
    this.bullets.push(beam);
    return 1;
  }

  update(dt){
    const list=this.bullets;
    const S=this.s;
    for (let i=list.length-1;i>=0;i--){
      const b=list[i];

      if (b.type==='beam'){
        b.life -= dt;
        if (b.life <= 0) { list.splice(i,1); continue; }

        const ex = b.x + Math.cos(b.dir) * b.range;
        const ey = b.y + Math.sin(b.dir) * b.range;
        const halfW = (b.width || 6) * 0.5;

        for (let j=S.zombies.length-1; j>=0; j--){
          const z = S.zombies[j];
          const vx = ex - b.x, vy = ey - b.y;
          const wx = z.x - b.x, wy = z.y - b.y;
          const vv = vx*vx + vy*vy || 1e-6;
          let t = (wx*vx + wy*vy) / vv; t = Math.max(0, Math.min(1, t));
          const cx = b.x + vx * t, cy = b.y + vy * t;
          const dist = Math.hypot(z.x - cx, z.y - cy);
          if (dist <= z.r + halfW){
            z.hp -= Math.max(1, Math.floor((b.dps||30) * dt));
            if (b.burn){
              z.burnTime = Math.max(z.burnTime||0, b.burn.time||0);
              z.burnDps  = b.burn.dps || z.burnDps || 0;
            }
            if (z.hp <= 0){
              this.onKill(z, j);
            }
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
    this.s.startShake && this.s.startShake(6, 280);
  }

  onKill(z, idx){
    const S=this.s;
    S.zombies.splice(idx,1);
    if (typeof S.onKill === 'function') S.onKill(z);
  }
}
