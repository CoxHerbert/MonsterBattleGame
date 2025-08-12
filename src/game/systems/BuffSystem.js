import { BUFFS } from '@/game/config/buffs.config.js';

export default class BuffSystem {
  constructor(){
    this.perm = { atk:0, aspd:0, speedP:0, hp:0 };
    this.temp = {};
    this.snapshot = this._emptySnap();
  }

  _emptySnap(){
    return {
      dmgMul:1, fireIntervalMul:1, moveMul:1, maxHpAdd:0,
      bullet:{ pierce:0, bounce:0, burn:null, split:null, shotsAdd:0, shotDmgMul:1 }
    };
  }

  setPermanent(levels){
    this.perm = { ...this.perm, ...levels };
    this._recompute();
  }

  addTemp(key, seconds){
    const cfg = BUFFS[key];
    if (!cfg || cfg.type !== 'temp') return;
    const dur = (seconds ?? cfg.dur) || 8;
    const cur = this.temp[key] || { left:0, stacks:0 };
    cur.left = Math.max(cur.left,0) + dur;
    cur.stacks = Math.min((cur.stacks||0)+1, 10);
    this.temp[key] = cur;
    this._recompute();
  }

  tick(dt){
    let changed=false;
    for (const k of Object.keys(this.temp)){
      const o=this.temp[k];
      o.left -= dt;
      if (o.left<=0){ delete this.temp[k]; changed=true; }
    }
    if (changed) this._recompute();
  }

  clearTemps(){ this.temp = {}; this._recompute(); }

  getSnapshot(){ return this.snapshot; }

  getActiveTemps(){
    return Object.entries(this.temp).map(([k,v])=>({ kind:k, left:Math.max(0,v.left), stacks:v.stacks||1 }));
  }

  getPermanentList(){
    return Object.entries(this.perm).filter(([_,lv])=>lv>0).map(([id,lv])=>({ id, level:lv }));
  }

  _recompute(){
    const snap=this._emptySnap();

    for (const [id,lv] of Object.entries(this.perm)){
      if (lv<=0) continue;
      const cfg = BUFFS[id]; if (!cfg) continue;
      const p = cfg.perLevel || {};
      if (p.dmgMul) snap.dmgMul *= Math.pow(p.dmgMul, lv);
      if (p.fireIntervalMul) snap.fireIntervalMul *= Math.pow(p.fireIntervalMul, lv);
      if (p.moveMul) snap.moveMul *= Math.pow(p.moveMul, lv);
      if (p.maxHp) snap.maxHpAdd += p.maxHp * lv;
    }

    for (const [key,state] of Object.entries(this.temp)){
      const cfg = BUFFS[key]; if (!cfg) continue;
      const eff = cfg.effects || {};
      if (eff.moveMul) snap.moveMul *= eff.moveMul;
      if (eff.dmgMul) snap.dmgMul *= eff.dmgMul;
      if (eff.fireIntervalMul) snap.fireIntervalMul *= eff.fireIntervalMul;
      if (eff.shots) snap.bullet.shotsAdd += eff.shots;
      const b = eff.bullet;
      if (b){
        if (b.pierce) snap.bullet.pierce += b.pierce;
        if (b.bounce) snap.bullet.bounce += b.bounce;
        if (b.split) snap.bullet.split = { ...(snap.bullet.split||{}), ...b.split };
        if (b.burn) snap.bullet.burn = { ...(snap.bullet.burn||{}), ...b.burn };
        if (b.dmgMul) snap.bullet.shotDmgMul *= b.dmgMul;
      }
    }

    this.snapshot = snap;
  }

  applyToBullet(proto){
    const s = this.snapshot;
    const b = { ...proto };
    b.dmg = Math.max(1, Math.floor((b.dmg||1) * (s.dmgMul||1) * (s.bullet.shotDmgMul||1)));
    if (s.bullet.pierce) b.pierce = (b.pierce||0) + s.bullet.pierce;
    if (s.bullet.bounce) b.bounce = (b.bounce||0) + s.bullet.bounce;
    if (s.bullet.burn) b.burn = { ...(b.burn||{}), ...s.bullet.burn };
    if (s.bullet.split) b.split = { ...(b.split||{}), ...s.bullet.split };
    if (s.bullet.shotsAdd) b._shotsAdd = (b._shotsAdd||0) + s.bullet.shotsAdd;
    return b;
  }

  applyToPlayer(base){
    const s=this.snapshot;
    return {
      speed: Math.floor(base.baseSpeed * (s.moveMul||1)),
      fireInterval: Math.max(0.03, base.fireInterval * (s.fireIntervalMul||1)),
      maxHp: Math.floor(base.maxHp + (s.maxHpAdd||0))
    };
  }
}
