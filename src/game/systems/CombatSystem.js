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
    // TODO: advance projectiles and handle collisions
  }
  stepEnemies(dt) {
    // TODO: advance enemies and handle interactions
  }
}
