import EnemyFactory from './EnemyFactory.js';
import EnemyAI from './EnemyAI.js';
import BossAI from './BossAI.js';
import ecfg from '../config/enemies.config.js';
import lcfg from '../config/loot.config.js';

export default class Spawner {
  constructor({ state, world, collision, enrage, bus, combat, audio }) {
    this.s = state; this.world = world; this.col = collision;
    this.bus = bus; this.combat = combat; this.audio = audio;
    this.factory = new EnemyFactory({ state, enrage, spawner:this });
    this.ai = new EnemyAI({ state, world, collision, spawner:this });
    this.bossAI = new BossAI({ state, spawner:this, combat, audio });

    bus.on?.('enemy:dead', (e)=> this.onDead(e));
  }

  spawnRingN(n){
    for (let i=0;i<n;i++) this.spawnNear();
  }

  spawnNear(pos=null, opts={}){
    const player = this.s.player;
    const ang = Math.random()*Math.PI*2;
    const R = 450 + Math.random()*200;
    const x = (pos?.x ?? player.x) + Math.cos(ang)*R;
    const y = (pos?.y ?? player.y) + Math.sin(ang)*R;
    const wave = this.s.wave || 1, chapter = this.s.chapter || 1;
    const eliteP = ecfg.spawn.eliteChance(wave, chapter);
    const baseKind = opts.forceKind || this.factory.pickCommonKindByWave(wave);
    const e = (Math.random()<eliteP) ? this.factory.createElite(baseKind, {x,y}, wave, chapter)
                                     : this.factory.createCommon(baseKind, {x,y}, wave, chapter);
    this.s.zombies.push(e);
    return e;
  }

  spawnAt(pos, opts={}){ return this.spawnNear(pos, opts); }

  spawnEliteNear(pos){
    const wave = this.s.wave || 1, chapter = this.s.chapter || 1;
    const baseKind = this.factory.pickCommonKindByWave(wave);
    const e = this.factory.createElite(baseKind, pos, wave, chapter);
    this.s.zombies.push(e); return e;
  }

  spawnBoss({ chapter, stage, intensity }){
    const player = this.s.player;
    const ang = Math.random()*Math.PI*2, R = 600 + Math.random()*200;
    const pos = { x: player.x + Math.cos(ang)*R, y: player.y + Math.sin(ang)*R };
    const boss = this.bossAI.createBoss(stage, chapter, intensity);
    boss.x = pos.x; boss.y = pos.y;
    this.s.zombies.push(boss);
    this.s.bossAlive = true;
    return boss;
  }

  update(dt){
    for (const z of this.s.zombies){
      if (z.hp<=0) continue;
      if (z.boss) this.bossAI.step(z, dt);
      else this.ai.step(z, dt);
    }
  }

  onDead(e){
    const tier = e.boss ? 'legendary' : (e.dropTier || (e.elite ? 'rare' : 'common'));
    this.rollLoot(tier, e.x, e.y);
  }

  rollLoot(tier, x, y){
    const spec = lcfg.tiers[tier]; if (!spec) return;
    const table = spec.table;
    for (let i=0;i<spec.rolls;i++){
      let r = Math.random()*table.reduce((s,[,w])=>s+w,0);
      let pick = table[table.length-1][0];
      for (const [id, w] of table){ r-=w; if (r<=0){ pick=id; break; } }
      this.s.drops.push({ type: pick, x, y, drawY:y, r:13, life:12, bob:0, icon:'?', color:'#ffd166' });
    }
  }
}
