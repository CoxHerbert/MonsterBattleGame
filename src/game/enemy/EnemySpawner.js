import { ENEMY_WEIGHTS, BOSS_ROTATION } from '../config/enemies.config.js'

export default class EnemySpawner {
  constructor({ state }){ this.s = state; }

  pickTypeByWave(wave){
    let pool = ENEMY_WEIGHTS[0].pool;
    for (const row of ENEMY_WEIGHTS) if (wave >= row.wave) pool = row.pool; else break;
    const total = pool.reduce((a,[,w])=>a+w,0);
    let r = Math.random()*total;
    for (const [t,w] of pool){ if ((r-=w)<=0) return t; }
    return pool[0][0];
  }

  spawnRing(){
    const tries = 10, p = this.s.player;
    for (let k=0;k<tries;k++){
      const ang = Math.random()*Math.PI*2, r = 460 + Math.random()*220;
      const x = p.x + Math.cos(ang)*r, y = p.y + Math.sin(ang)*r;
      if (this.s.pointHitObstacle?.(x, y)) continue;
      const type = this.pickTypeByWave(this.s.wave);
      const z = this.s.enemyFactory.create(type, x, y, this.s.wave, this.s.enemyPower);
      this.s.zombies.push(z);
      return;
    }
  }

  spawnRingN(n=1){ for(let i=0;i<n;i++) this.spawnRing(); }

  spawnBoss(){
    const p = this.s.player;
    const ang = Math.random()*Math.PI*2, R = 600 + Math.random()*200;
    const x = p.x + Math.cos(ang)*R, y = p.y + Math.sin(ang)*R;
    const idx = (this.s.bossIndex||0)%BOSS_ROTATION.length;
    const type = BOSS_ROTATION[idx];
    const z = this.s.enemyFactory.create(type, x, y, this.s.wave, this.s.enemyPower);
    this.s.zombies.push(z);
    this.s.bossAlive = true;
    this.s.bossIndex = idx+1;
    return z;
  }
}
