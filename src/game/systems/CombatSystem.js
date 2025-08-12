export default class CombatSystem {
  constructor({ state, collision, bus, audio }) {
    this.s = state;
    this.col = collision;
    this.bus = bus;
    this.audio = audio;
  }
  update(dt) {
    // TODO: manage fire cooldowns and buffs
  }
  fireBullet() {
    // TODO: implement bullet creation and effects
  }
  stepProjectiles(dt) {
    for (let i=this.s.bullets.length-1; i>=0; i--){
      const b = this.s.bullets[i];
      b.life -= dt;
      b.x += Math.cos(b.dir||0) * (b.speed||0) * dt;
      b.y += Math.sin(b.dir||0) * (b.speed||0) * dt;
      if (b.life<=0){ this.s.bullets.splice(i,1); continue; }
      for (const z of this.s.zombies){
        const dx = z.x - b.x, dy = z.y - b.y;
        const rr = (z.r||10)*(z.r||10);
        if (dx*dx + dy*dy <= rr){
          this.applyDamage(z, b.dmg||1);
          this.s.bullets.splice(i,1);
          break;
        }
      }
    }
  }
  stepEnemies(dt) {
    for (let i=this.s.zombies.length-1; i>=0; i--){
      const z = this.s.zombies[i];
      if (z.hp<=0){
        this.bus.emit?.('enemy:dead', z);
        this.s.zombies.splice(i,1);
      }
    }
  }

  applyDamage(target, dmg){
    target.hp -= dmg;
    if (target.hp<=0){
      this.bus.emit?.('enemy:dead', target);
    }
  }
}
