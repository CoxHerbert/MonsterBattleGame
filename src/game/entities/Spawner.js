export default class Spawner {
  constructor({ state, world }) {
    this.s = state;
    this.world = world;
  }
  update(dt) {
    // TODO: manage spawn timers and create enemies/bosses
  }

  spawnZombieRing() {
    this.s.zombies.push({ hp: 10, maxHp: 10, speed: 1, dmg: 1 });
  }

  spawnRingN(n = 1) {
    for (let i = 0; i < n; i++) this.spawnZombieRing();
  }

  spawnBoss({ chapter, stage, intensity }) {
    const bonus = Math.pow(1.25, stage - 1);
    const hp = 200 * intensity * bonus;
    this.s.zombies.push({ boss: true, hp, maxHp: hp, speed: 1 * intensity, dmg: 10 * intensity });
  }
}
