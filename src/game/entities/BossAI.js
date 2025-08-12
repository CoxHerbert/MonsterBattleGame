import bcfg from '../config/boss.config.js';

function randIn([a,b]){ return a + Math.random()*(b-a); }
function pickWeighted(skills){
  const sum = skills.reduce((s,k)=>s+(k.weight||1),0); let r=Math.random()*sum;
  for (const k of skills){ r-= (k.weight||1); if (r<=0) return k; } return skills[skills.length-1];
}

export default class BossAI {
  constructor({ state, spawner, combat, audio }) {
    this.s = state; this.spawner = spawner; this.combat = combat; this.audio = audio;
    this.cd = 0; this.curSkill = null;
  }

  createBoss(stage, chapter, intensity){
    const m = bcfg.stageMul(stage) * intensity;
    const b = {
      boss:true, elite:true, stage,
      r: bcfg.base.r,
      maxHp: Math.floor(bcfg.base.hp * m),
      hp: 0,
      speed: bcfg.base.speed * (0.9 + 0.1*m),
      dmg: Math.floor(bcfg.base.dmg * m),
      def: bcfg.base.def,
      ai: { kind:'boss' }
    };
    b.hp = b.maxHp; return b;
  }

  step(e, dt){
    const p = this.s.player, dir = Math.atan2(p.y - e.y, p.x - e.x);
    e.x += Math.cos(dir) * e.speed * dt * 0.8;
    e.y += Math.sin(dir) * e.speed * dt * 0.8;
    this.cd -= dt; if (this.cd>0) return;
    const skill = pickWeighted(bcfg.skills);
    this._cast(skill.id, e, skill.params);
    this.cd = randIn(skill.cd);
  }

  _cast(id, e, p){
    if (id==='rush') return this._rush(e, p);
    if (id==='fan')  return this._fan(e, p);
    if (id==='call') return this._call(e, p);
  }

  _rush(e, p){
    e.dashing = true; e.dashTime = p.dur; e.dir = Math.atan2(this.s.player.y - e.y, this.s.player.x - e.x);
    setTimeout(()=>{}, p.wind*1000);
  }

  _fan(e, p){
    const baseDir = Math.atan2(this.s.player.y - e.y, this.s.player.x - e.x);
    for (let w=0; w<p.waves; w++){
      setTimeout(()=>{
        for (let i=0;i<p.perWave;i++){
          const t = (i/(p.perWave-1)-0.5)*p.spread;
          this.s.bullets.push({ x:e.x, y:e.y, dir: baseDir+t, speed:p.speed, dmg:e.dmg*0.8, life:p.life, from:'enemy', color:'#ff6b6b' });
        }
      }, w*p.gap*1000);
    }
  }

  _call(e, p){
    if (p.elites>0){
      const ang = Math.random()*Math.PI*2, r = p.ringR;
      const pos = { x: e.x + Math.cos(ang)*r, y: e.y + Math.sin(ang)*r };
      this.spawner.spawnEliteNear(pos);
    }
    for (let i=0;i<p.mobs;i++){
      const ang = Math.random()*Math.PI*2, r = p.ringR*0.85;
      const pos = { x: e.x + Math.cos(ang)*r, y: e.y + Math.sin(ang)*r };
      this.spawner.spawnNear(pos);
    }
  }
}
